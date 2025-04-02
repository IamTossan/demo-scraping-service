import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MistralaiService } from './mistralai.service';

export const InvoiceEnvValidationSchema = {
  MISTRAL_API_KEY: Joi.string().required(),
};

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  providers: [MistralaiService, InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
