import { BaseEntity } from 'src/base-entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ schema: 'auth', synchronize: false, name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export enum InvoiceStatus {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}
@Entity()
export class Invoice extends BaseEntity {
  @Column()
  fileName: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.CREATED,
  })
  status: InvoiceStatus;

  @Column('date', { nullable: true })
  invoiceDate: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  description: string;

  @Column('float', { nullable: true })
  amountExclTax: number;

  @Column('float', { nullable: true })
  amountTotal: number;

  @Column('float', { nullable: true })
  amountTax: number;

  @Column()
  filePath: string;
}
