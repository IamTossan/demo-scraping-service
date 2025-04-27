import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { context, propagation } from '@opentelemetry/api';
import { backOff } from 'exponential-backoff';
import type { Request } from 'express';
import { Public } from 'src/auth.guard';
import { LoggerWithOTEL } from 'src/logger';
import { BlockStorageService } from './block-storage.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceOcrFailedEvent } from './messages/InvoiceOcrFailedEvent';
import { InvoiceOcrFinishedEvent } from './messages/InvoiceOcrFinishedEvent';
import { InvoiceUploadedEvent } from './messages/InvoiceUploadedEvent';
import { MistralaiService } from './mistralai.service';
import { throttle } from 'src/utils';

@Controller('invoice')
export class InvoiceController {
  private readonly logger = new LoggerWithOTEL(InvoiceController.name);

  constructor(
    private readonly mistralaiService: MistralaiService,
    private readonly invoiceService: InvoiceService,
    private readonly blockStorageService: BlockStorageService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get('/:id')
  async findOne(
    @Param('id') id: string,
  ): Promise<Invoice & { signedUrl: string }> {
    const invoice = await this.invoiceService.findOne(id);
    const signedUrl = await this.blockStorageService.getSignedUrl(
      invoice.filePath,
    );
    return { ...invoice, signedUrl };
  }

  @Get()
  async findAllByUserId(@Req() req: Request): Promise<Invoice[]> {
    const userId = req.user!.sub;
    return this.invoiceService.findAllByUserId(userId);
  }

  @Patch('/:id')
  async updateById(
    @Param('id') id: string,
    @Body() payload: UpdateInvoiceDto,
  ): Promise<{ message: string }> {
    await this.invoiceService.updateById(id, payload);
    return { message: 'ok' };
  }

  async uploadInvoice(
    userId: string,
    file: Express.Multer.File,
    tracingContext: Record<string, string>,
  ): Promise<[InvoiceUploadedEvent, null] | [null, Error]> {
    try {
      const filePath = await this.blockStorageService.upload(file);
      const event = new InvoiceUploadedEvent({
        userId,
        filePath,
        _meta: tracingContext,
      });

      await this.invoiceService.create({
        id: event.invoiceId,
        fileName: file.originalname,
        filePath,
        user: { id: userId },
      });

      return [event, null];
    } catch (error) {
      this.logger.error(
        `Error uploading invoice ${file.originalname}: ${(error as Error).message}`,
      );
      return [null, error as Error];
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'An invoice file to upload, in pdf format' })
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async getData(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ): Promise<{
    message: string;
  }> {
    const userId = req.user!.sub;
    const tracingContext = {};
    propagation.inject(context.active(), tracingContext);

    const res = await Promise.all(
      files.map((file) => this.uploadInvoice(userId, file, tracingContext)),
    );

    const failCount = res.filter(([, e]) => e).length;
    if (failCount > 0) {
      return { message: 'Error uploading file(s)' };
    }

    const events: InvoiceUploadedEvent[] = res
      .map(([e]) => e)
      .filter((e) => e !== null);
    // we throttle the events to mitigate the mistralai 1 req/s rate limit
    await throttle(
      events.map(
        (e) => () => this.natsClient.emit(InvoiceUploadedEvent.event_name, e),
      ),
      1000,
    );

    return {
      message: 'File(s) uploaded successfully',
    };
  }

  async _handleInvoiceUploadedEvent(event: InvoiceUploadedEvent) {
    await this.invoiceService.updateById(event.invoiceId, {
      status: InvoiceStatus.STARTED,
    });

    const blob = await this.blockStorageService.download(event.filePath);
    const signedUrl = await this.mistralaiService.uploadFile(blob);

    const extract = await backOff(
      async () => this.mistralaiService.processFile(signedUrl),
      {
        jitter: 'full',
        retry: (e: Error, attempt: number) => {
          this.logger.warn(
            `Error processing file ${event.filePath} (attempt ${attempt}): ${e.message}`,
          );
          return true;
        },
      },
    );

    await this.invoiceService.updateById(event.invoiceId, {
      ...extract,
      status: InvoiceStatus.COMPLETED,
    });
    this.natsClient.emit(
      InvoiceOcrFinishedEvent.event_name,
      new InvoiceOcrFinishedEvent(event.invoiceId),
    );
  }

  @Public()
  @EventPattern(InvoiceUploadedEvent.event_name)
  async handleInvoiceUploadedEvent(event: InvoiceUploadedEvent) {
    try {
      const activeContext = propagation.extract(context.active(), event._meta);
      await context.with(
        activeContext,
        this._handleInvoiceUploadedEvent.bind(this),
        this,
        event,
      );
    } catch (error) {
      await this.invoiceService.updateById(event.invoiceId, {
        status: InvoiceStatus.FAILED,
      });
      this.logger.error(
        `Invoice OCR failed for invoice ${event.invoiceId}: ${error}`,
      );
      this.natsClient.emit(
        InvoiceOcrFailedEvent.event_name,
        new InvoiceOcrFailedEvent(event.invoiceId, (error as Error).message),
      );
    }
  }
}
