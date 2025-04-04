import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScrapingTask } from './entities/scraping-task.entity';
import { CreateScrapingTaskCommand } from './messages/CreateScrapingTaskCommand';

@Injectable()
export class ScrapingTaskService {
  constructor(
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async create(command: CreateScrapingTaskCommand) {
    const task = new ScrapingTask();
    task.id = command.id;
    task.targetDomain = command.targetDomain;
    await this.scrapingTaskRepository.save(task);
  }

  findAll() {
    return this.scrapingTaskRepository.find();
  }

  findOne(id: string) {
    return this.scrapingTaskRepository.findOneBy({ id });
  }
}
