export class ScrapingTaskCreatedEvent {
  constructor(
    public readonly targetDomain: string,
    public readonly taskId: number,
  ) {}
}
