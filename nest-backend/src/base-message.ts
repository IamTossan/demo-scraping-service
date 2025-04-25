import { toSnakeCase } from './utils';

export abstract class Command {
  static get event_name(): string {
    return 'command.' + toSnakeCase(this.name.split('Command')[0]);
  }
}
export abstract class Event {
  public readonly _meta: { traceparent?: string; tracestate?: string };

  static get event_name(): string {
    return 'event.' + toSnakeCase(this.name.split('Event')[0]);
  }
}
