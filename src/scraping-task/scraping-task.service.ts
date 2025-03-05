import { Injectable } from '@nestjs/common';
import { CreateScrapingTaskDto } from './dto/create-scraping-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ScrapingTask } from './entities/scraping-task.entity';
import { Repository } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { ScrapeTaskRequestCommand } from './messages/ScrapeTaskRequestCommand';

@Injectable()
export class ScrapingTaskService {
  constructor(
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
    private commandBus: CommandBus,
  ) { }

  async create(createScrapingTaskDto: CreateScrapingTaskDto) {
    return this.commandBus.execute(
      new ScrapeTaskRequestCommand(createScrapingTaskDto.targetDomain),
    );
  }

  findAll() {
    return this.scrapingTaskRepository.find();
  }

  findOne(id: number) {
    return this.scrapingTaskRepository.findOneBy({ id });
  }
}
