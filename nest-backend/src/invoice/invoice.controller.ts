import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { BlockStorageService } from './block-storage.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceExtract } from './entities/invoice-extract';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { MistralaiService } from './mistralai.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly mistralaiService: MistralaiService,
    private readonly invoiceService: InvoiceService,
    private readonly blockStorageService: BlockStorageService,
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

  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'An invoice file to upload, in pdf format' })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async getData(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{
    message: InvoiceExtract;
  }> {
    const userId = req.user!.sub;
    const filePath = await this.blockStorageService.upload(file);
    const signedUrl = await this.mistralaiService.uploadFile(file.buffer);
    const extract = await this.mistralaiService.processFile(signedUrl);
    await this.invoiceService.create({
      ...extract,
      fileName: file.originalname,
      filePath,
      user: { id: userId },
    });
    return {
      message: extract,
    };
  }
}
