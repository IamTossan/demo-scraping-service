import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ScrapeTaskRequestCommand } from '../messages/ScrapeTaskRequestCommand';
import { ScrapingTask } from '../entities/scraping-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingTaskCreatedEvent } from '../messages/ScrapingTaskCreated.event';

@CommandHandler(ScrapeTaskRequestCommand)
export class ScrapeTaskRequestHandler
  implements ICommandHandler<ScrapeTaskRequestCommand> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
  ) { }

  async execute(
    command: ScrapeTaskRequestCommand,
  ): Promise<{ commandId: number }> {
    const task = new ScrapingTask();
    task.targetDomain = command.targetDomain;
    await this.scrapingTaskRepository.save(task);
    this.eventBus.publish(
      new ScrapingTaskCreatedEvent(task.targetDomain, task.id),
    );
    return { commandId: task.id };
  }
}
