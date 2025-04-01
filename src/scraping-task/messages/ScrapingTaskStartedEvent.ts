import { Event } from 'src/base-message';

export class ScrapingTaskStartedEvent extends Event {
  constructor(public readonly taskId: string) {
    super();
  }
}
