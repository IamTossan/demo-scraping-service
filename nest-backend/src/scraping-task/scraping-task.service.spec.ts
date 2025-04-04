import { Test, TestingModule } from '@nestjs/testing';
import { ScrapingTaskService } from './scraping-task.service';

describe('ScrapingTaskService', () => {
  let service: ScrapingTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapingTaskService],
    }).compile();

    service = module.get<ScrapingTaskService>(ScrapingTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
