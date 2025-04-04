import { Command } from 'src/base-message';
import { uuidv7 } from 'uuidv7';

export class CreateScrapingTaskCommand extends Command {
  targetDomain: string;
  id: string;

  constructor(payload: { targetDomain: string }) {
    super();
    Object.assign(this, payload);
    this.id = uuidv7();
  }
}
