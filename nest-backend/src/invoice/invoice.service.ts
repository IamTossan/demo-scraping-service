import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceExtract } from './entities/invoice-extract';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(
    invoice: InvoiceExtract & Pick<Invoice, 'fileName' | 'fileContent'>,
  ): Promise<Invoice> {
    const newInvoice = this.invoiceRepository.create(invoice);
    return this.invoiceRepository.save(newInvoice);
  }

  async updateById(
    id: string,
    payload: Partial<Omit<Invoice, 'fileName' | 'fileContent'>>,
  ) {
    await this.invoiceRepository.update({ id }, payload);
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id });
    if (!invoice)
      throw new NotFoundException(`Invoice with id ${id} not found`);
    return invoice;
  }
}
