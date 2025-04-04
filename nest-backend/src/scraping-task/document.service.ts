import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as cheerio from 'cheerio';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import {
  ScrapingTask,
  ScrapingTaskStatus,
} from './entities/scraping-task.entity';
import { ScrapingTaskCreatedEvent } from './messages/ScrapingTaskCreatedEvent';
import { ScrapingTaskStartedEvent } from './messages/ScrapingTaskStartedEvent';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(ScrapingTask)
    private readonly scrapingTaskRepository: Repository<ScrapingTask>,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async scrapeTargetdomain(event: ScrapingTaskCreatedEvent) {
    await this.scrapingTaskRepository.update(event.taskId, {
      status: ScrapingTaskStatus.STARTED,
    });
    const scrapingStartedEvent = new ScrapingTaskStartedEvent(event.taskId);
    this.natsClient.emit(scrapingStartedEvent.event_name, scrapingStartedEvent);

    const $ = await cheerio.fromURL(event.targetDomain);

    const documents: Document[] = [];
    $('.titleline > a').each(function (i, item) {
      const doc = new Document();
      doc.task = Object.assign(new ScrapingTask(), { id: event.taskId });
      doc.source = $(this).attr('href') || 'not found';
      doc.title = $(this).text();
      doc.publishedAt = new Date(
        $(this)
          .parent()
          .parent()
          .parent()
          .next()
          .find('.age')
          .attr('title')!
          .split(' ')[0],
      );
      doc.link =
        event.targetDomain +
        $(this).parent().parent().parent().next().find('.age > a').attr('href');

      documents.push(doc);
    });

    await this.documentRepository.save(documents);
    await this.scrapingTaskRepository.update(event.taskId, {
      status: ScrapingTaskStatus.FINISHED,
    });
  }

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
          SELECT distinct
            first_value(id)
            over (partition by "targetDomain" order by id desc) as id
          FROM
            scraping_task
          WHERE
            status = 'FINISHED'
        )
        SELECT
          *
        FROM
          document
        WHERE
          "taskId" IN (SELECT id FROM latest_finished_tasks)
          ${domain ? `AND title RLIKE '${domain.join('|')}'` : ''}
        ORDER BY
          "publishedAt" DESC
        ${limit ? `LIMIT ${limit}` : ''}
        ${skip ? `OFFSET ${skip}` : ''}
        ;
      `,
    );
  }

  async removeOldVersions(taskId: string) {
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
