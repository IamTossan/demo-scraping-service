import { Event } from 'src/base-message';

export class InvoiceOcrFailedEvent extends Event {
  constructor(
    public readonly invoiceId: string,
    public readonly errorMessage: string,
  ) {
    super();
  }
}
