import { toSnakeCase } from './utils';

export abstract class Command {
  get event_name(): string {
    return 'command.' + toSnakeCase(this.constructor.name.split('Command')[0]);
  }
}
export abstract class Event {
  get event_name(): string {
    return 'event.' + toSnakeCase(this.constructor.name.split('Event')[0]);
  }
}
