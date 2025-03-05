import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScrapingTaskService } from './scraping-task.service';
import { ScrapingTaskController } from './scraping-task.controller';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { ScrapingTask } from './entities/scraping-task.entity';
import { Document } from './entities/document.entity';
import { ScrapeTaskRequestHandler } from './handlers/scrape-task-request.handler';
import { ScrapingTaskCreatedHandler } from './handlers/scraping-task-created.handler';
import { ScrapingTaskFinishedHandler } from './handlers/scraping-task-finished.handler';

@Module({
  imports: [TypeOrmModule.forFeature([ScrapingTask, Document])],
  controllers: [ScrapingTaskController, DocumentController],
  providers: [
    ScrapingTaskService,
    DocumentService,
    ScrapeTaskRequestHandler,
    ScrapingTaskCreatedHandler,
    ScrapingTaskFinishedHandler,
  ],
})
export class ScrapingTaskModule {}
