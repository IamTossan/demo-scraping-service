import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Invoice, User } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MistralaiService } from './mistralai.service';
import { BlockStorageService } from './block-storage.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const InvoiceEnvValidationSchema = {
  MISTRAL_API_KEY: Joi.string().required(),
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, User]),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'NATS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.get('NATS_URL')!],
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MistralaiService, InvoiceService, BlockStorageService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
