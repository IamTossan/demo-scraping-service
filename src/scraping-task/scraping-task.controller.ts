import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { CreateScrapingTaskDto } from './dto/create-scraping-task.dto';
import { CreateScrapingTaskCommand } from './messages/CreateScrapingTaskCommand';
import { ScrapingTaskService } from './scraping-task.service';
import { ScrapingTaskCreatedEvent } from './messages/ScrapingTaskCreatedEvent';

@Controller('scraping-task')
export class ScrapingTaskController {
  constructor(
    private readonly scrapingTaskService: ScrapingTaskService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() createScrapingTaskDto: CreateScrapingTaskDto) {
    const command = new CreateScrapingTaskCommand(createScrapingTaskDto);
    this.natsClient.emit(command.event_name, command);
  }

  @EventPattern('command.create_scraping_task')
  async onScrapingTaskrequested(command: CreateScrapingTaskCommand) {
    await this.scrapingTaskService.create(command);
    const event = new ScrapingTaskCreatedEvent(
      command.id,
      command.targetDomain,
    );
    this.natsClient.emit(event.event_name, event);
  }

  @Get()
  findAll() {
    return this.scrapingTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scrapingTaskService.findOne(id);
  }
}
