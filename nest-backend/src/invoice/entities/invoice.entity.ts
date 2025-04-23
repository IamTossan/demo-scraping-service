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

@Entity()
export class Invoice extends BaseEntity {
  @Column()
  fileName: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @Column()
  invoiceDate: string;

  @Column()
  supplier: string;

  @Column()
  description: string;

  @Column('float')
  amountExclTax: number;

  @Column('float')
  amountTotal: number;

  @Column('float')
  amountTax: number;

  @Column()
  filePath: string;
}
