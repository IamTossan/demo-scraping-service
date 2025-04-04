import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base-entity';
import { Document } from './document.entity';

export enum ScrapingTaskStatus {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
}

@Entity()
export class ScrapingTask extends BaseEntity {
  @Index()
  @Column()
  targetDomain: string;

  @OneToMany(() => Document, (doc) => doc.task)
  documents: Document[];

  @Column({
    type: 'enum',
    enum: ScrapingTaskStatus,
    default: ScrapingTaskStatus.CREATED,
  })
  status: ScrapingTaskStatus;
}
