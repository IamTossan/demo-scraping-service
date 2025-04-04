import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { DocumentService } from './document.service';
import { OldDocumentsRemovedEvent } from './messages/OldDocumentsRemovedEvent';
import { ScrapingTaskCreatedEvent } from './messages/ScrapingTaskCreatedEvent';
import { ScrapingTaskFinishedEvent } from './messages/ScrapingTaskFinishedEvent';

@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  find(
    // TODO: add validation alphanum for domain to prevent SQL injections
    @Query('domain') domain: string[],
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ) {
    return this.documentService.find({ domain, limit, skip });
  }

  @EventPattern('event.scraping_task_created')
  async onScrapingTaskCreated(event: ScrapingTaskCreatedEvent) {
    await this.documentService.scrapeTargetdomain(event);
    const finishedEvent = new ScrapingTaskFinishedEvent(event.taskId);
    this.natsClient.emit(finishedEvent.event_name, finishedEvent);
  }

  @EventPattern('event.scraping_task_finished')
  async onScrapingTaskFinished(event: ScrapingTaskFinishedEvent) {
    await this.documentService.removeOldVersions(event.taskId);
    const removedEvent = new OldDocumentsRemovedEvent(event.taskId);
    this.natsClient.emit(removedEvent.event_name, removedEvent);
  }
}
