export class ScrapingTaskFailedEvent {
  constructor(
    public readonly taskId: string,
    public readonly error: string,
  ) {}
}
