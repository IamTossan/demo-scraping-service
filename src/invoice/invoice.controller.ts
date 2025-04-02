import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoiceExtract } from './entities/invoice-extract';
import { InvoiceService } from './invoice.service';
import { MistralaiService } from './mistralai.service';
import { Invoice } from './entities/invoice.entity';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly mistralaiService: MistralaiService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Invoice> {
    return this.invoiceService.findOne(id);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return this.invoiceService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async getData(@UploadedFile() file: Express.Multer.File): Promise<{
    message: InvoiceExtract;
  }> {
    const signedUrl = await this.mistralaiService.uploadFile(file.buffer);
    const extract = await this.mistralaiService.processFile(signedUrl);
    await this.invoiceService.create({
      ...extract,
      fileName: file.originalname,
      fileContent: file.buffer,
    });
    return {
      message: extract,
    };
  }
}
