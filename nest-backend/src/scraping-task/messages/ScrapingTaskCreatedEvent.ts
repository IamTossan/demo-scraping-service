import { Event } from 'src/base-message';

export class ScrapingTaskCreatedEvent extends Event {
  constructor(
    public readonly taskId: string,
    public readonly targetDomain: string,
  ) {
    super();
  }
}
