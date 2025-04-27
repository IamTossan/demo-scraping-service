import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    invoice: Pick<Invoice, 'id' | 'fileName' | 'user' | 'filePath'>,
  ): Promise<Invoice> {
    const newInvoice = this.invoiceRepository.create(invoice);
    return this.invoiceRepository.save(newInvoice);
  }

  async updateById(
    id: string,
    payload: Partial<Omit<Invoice, 'id' | 'user' | 'fileName'>>,
  ) {
    await this.invoiceRepository.update({ id }, payload);
  }

  async findAllByUserId(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id });
    if (!invoice)
      throw new NotFoundException(`Invoice with id ${id} not found`);
    return invoice;
  }
}
