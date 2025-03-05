import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base-entity';
import { ScrapingTask } from './scraping-task.entity';

@Entity()
@Index(['task', 'publishedAt'])
export class Document extends BaseEntity {
  @ManyToOne(() => ScrapingTask, (st) => st.documents)
  task: ScrapingTask;

  @Column()
  title: string;

  @Column()
  link: string;

  @Column()
  source: string;

  @Column()
  publishedAt: Date;
}
