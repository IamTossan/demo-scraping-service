import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScrapingTaskService } from './scraping-task.service';
import { CreateScrapingTaskDto } from './dto/create-scraping-task.dto';

@Controller('scraping-task')
export class ScrapingTaskController {
  constructor(private readonly scrapingTaskService: ScrapingTaskService) {}

  @Post()
  create(@Body() createScrapingTaskDto: CreateScrapingTaskDto) {
    return this.scrapingTaskService.create(createScrapingTaskDto);
  }

  @Get()
  findAll() {
    return this.scrapingTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scrapingTaskService.findOne(+id);
  }
}
