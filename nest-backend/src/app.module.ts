import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingTaskModule } from './scraping-task/scraping-task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  InvoiceEnvValidationSchema,
  InvoiceModule,
} from './invoice/invoice.module';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        OTEL_EXPORTER_OTLP_GRPC_ENDPOINT: Joi.string().required(),
        OTEL_EXPORTER_OTLP_HTTP_ENDPOINT: Joi.string().required(),
        OTEL_SERVICE_NAME: Joi.string().required(),
        NATS_URL: Joi.string().required(),
        ...InvoiceEnvValidationSchema,
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
        // logging: ['query'],
      }),
      inject: [ConfigService],
    }),
    ScrapingTaskModule,
    InvoiceModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
