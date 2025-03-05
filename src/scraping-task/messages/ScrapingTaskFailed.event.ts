export class ScrapingTaskFailedEvent {
  constructor(
    public readonly taskId: number,
    public readonly error: string,
  ) { }
}
