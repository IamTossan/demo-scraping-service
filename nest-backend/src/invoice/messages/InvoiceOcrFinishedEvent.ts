import { Event } from 'src/base-message';

export class InvoiceOcrFinishedEvent extends Event {
  constructor(public readonly invoiceId: string) {
    super();
  }
}
