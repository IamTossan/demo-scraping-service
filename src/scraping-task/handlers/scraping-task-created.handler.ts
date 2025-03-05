import * as cheerio from 'cheerio';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  ScrapingTask,
  ScrapingTaskStatus,
} from '../entities/scraping-task.entity';
import { Document } from '../entities/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingTaskCreatedEvent } from '../messages/ScrapingTaskCreated.event';
import { ScrapingTaskFailedEvent } from '../messages/ScrapingTaskFailed.event';
import { ScrapingTaskFinishedEvent } from '../messages/ScrapingTaskFinished.event';
import { ScrapingTaskStartedEvent } from '../messages/ScrapingTaskStarted.event';

@EventsHandler(ScrapingTaskCreatedEvent)
export class ScrapingTaskCreatedHandler
  implements IEventHandler<ScrapingTaskCreatedEvent> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) { }

  async handle(event: ScrapingTaskCreatedEvent): Promise<void> {
    const task = await this.scrapingTaskRepository.findOneBy({
      id: event.taskId,
    });
    if (!task) {
      this.eventBus.publish(
        new ScrapingTaskFailedEvent(event.taskId, 'task not found'),
      );
      return;
    }
    this.scrapingTaskRepository.update(event.taskId, {
      status: ScrapingTaskStatus.STARTED,
    });
    this.eventBus.publish(new ScrapingTaskStartedEvent(event.taskId));

    const $ = await cheerio.fromURL(event.targetDomain);

    const documents: Document[] = [];
    $('.titleline > a').each(function(i, item) {
      const doc = new Document();
      doc.task = task;
      doc.source = $(this).attr('href') || 'not found';
      doc.title = $(this).text();
      doc.publishedAt = new Date(
        $(this)
          .parent()
          .parent()
          .parent()
          .next()
          .find('.age')
          .attr('title')!
          .split(' ')[0],
      );
      doc.link =
        event.targetDomain +
        $(this).parent().parent().parent().next().find('.age > a').attr('href');

      documents.push(doc);
    });

    this.documentRepository.save(documents);
    this.scrapingTaskRepository.update(event.taskId, {
      status: ScrapingTaskStatus.FINISHED,
    });
    this.eventBus.publish(new ScrapingTaskFinishedEvent(event.taskId));
  }
}
