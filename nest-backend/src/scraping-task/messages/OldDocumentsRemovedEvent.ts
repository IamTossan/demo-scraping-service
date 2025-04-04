import { Event } from 'src/base-message';

export class OldDocumentsRemovedEvent extends Event {
  constructor(public readonly currentTaskId: string) {
    super();
  }
}
