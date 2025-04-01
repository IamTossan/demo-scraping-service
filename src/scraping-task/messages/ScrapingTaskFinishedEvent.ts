import { Event } from 'src/base-message';

export class ScrapingTaskFinishedEvent extends Event {
  constructor(public readonly taskId: string) {
    super();
  }
}
