import { Command } from '@nestjs/cqrs';

export class ScrapeTaskRequestCommand extends Command<{ commandId: number }> {
  constructor(public readonly targetDomain: string) {
    super();
  }
}
