import { IsNotEmpty } from 'class-validator';

export class CreateScrapingTaskDto {
  @IsNotEmpty()
  targetDomain: string;
}
