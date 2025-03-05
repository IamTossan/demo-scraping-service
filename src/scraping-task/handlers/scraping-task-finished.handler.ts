import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ScrapingTaskFinishedEvent } from '../messages/ScrapingTaskFinished.event';
import { DocumentService } from '../document.service';
import { OldDocumentsRemovedEvent } from '../messages/OldDocumentsRemoved.event';

@EventsHandler(ScrapingTaskFinishedEvent)
export class ScrapingTaskFinishedHandler
  implements IEventHandler<ScrapingTaskFinishedEvent>
{
  constructor(
    private readonly eventBus: EventBus,
    private readonly documentService: DocumentService,
  ) {}

  async handle(event: ScrapingTaskFinishedEvent): Promise<void> {
    await this.documentService.removeOldVersions(event.taskId);
    this.eventBus.publish(new OldDocumentsRemovedEvent(event.taskId));
  }
}
