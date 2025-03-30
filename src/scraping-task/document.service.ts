import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import {
  ScrapingTask,
  ScrapingTaskStatus,
} from './entities/scraping-task.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  find({
    domain,
    skip,
    limit,
  }: {
    domain?: string[];
    skip?: number;
    limit?: number;
  }) {
    // https://timilearning.com/posts/mit-6.824/lecture-3-gfs/#record-appends
    // if the consistency constraints are less strict, you can just:
    // return this.documentRepository.find();
    return this.dataSource.query(
      `
        WITH latest_finished_tasks AS (
          SELECT
            MAX(id) AS id
          FROM
            scraping_task
          WHERE
            status = 'FINISHED'
          GROUP BY
            "targetDomain"
        )
        SELECT
          *
        FROM
          document
        WHERE
          "taskId" IN (SELECT id FROM latest_finished_tasks)
          ${domain ? `AND title RLIKE \'${domain.join('|')}\'` : ''}
        ORDER BY
          "publishedAt" DESC
        ${limit ? `LIMIT ${limit}` : ''}
        ${skip ? `OFFSET ${skip}` : ''}
        ;
      `,
    );
  }

  async removeOldVersions(taskId: number) {
    const currentTask = await this.scrapingTaskRepository.findOneBy({
      id: taskId,
    });
    if (!currentTask) {
      throw new NotFoundException();
    }
    const oldTasks = await this.scrapingTaskRepository.find({
      where: {
        targetDomain: currentTask.targetDomain,
        status: ScrapingTaskStatus.FINISHED,
        id: Not(taskId),
      },
      order: { id: 'DESC' },
      take: 1, // delete documents from last n tasks
    });
    await this.documentRepository.delete({
      task: {
        id: In(oldTasks.map((t) => t.id)),
      },
    });
  }
}
