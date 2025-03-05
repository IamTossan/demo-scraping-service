import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingTaskController } from './scraping-task.controller';
import { ScrapingTaskService } from './scraping-task.service';

describe('ScrapingTaskController', () => {
  let controller: ScrapingTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScrapingTaskController],
      providers: [ScrapingTaskService],
    }).compile();

    controller = module.get<ScrapingTaskController>(ScrapingTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
