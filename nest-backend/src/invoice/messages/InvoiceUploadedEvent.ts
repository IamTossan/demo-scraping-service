import { Event } from 'src/base-message';

import { uuidv7 } from 'uuidv7';

export class InvoiceUploadedEvent extends Event {
  public readonly invoiceId: string;
  public readonly userId: string;
  public readonly filePath: string;

  constructor(
    payload: { userId: string; filePath: string } & { _meta: Event['_meta'] },
  ) {
    super();
    Object.assign(this, payload);
    this.invoiceId = uuidv7();
  }
}
