import { BaseEntity } from 'src/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Invoice extends BaseEntity {
  @Column()
  fileName: string;

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

  @Column('bytea')
  fileContent: Buffer;
}
