import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScrapingTaskService } from './scraping-task.service';
import { ScrapingTaskController } from './scraping-task.controller';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { ScrapingTask } from './entities/scraping-task.entity';
import { Document } from './entities/document.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'NATS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            queue: 'scraping_dev',
            servers: ['nats://localhost:4222'],
          },
        }),
        inject: [ConfigService],
      },
    ]),
    TypeOrmModule.forFeature([ScrapingTask, Document]),
  ],
  controllers: [ScrapingTaskController, DocumentController],
  providers: [ScrapingTaskService, DocumentService],
})
export class ScrapingTaskModule {}
