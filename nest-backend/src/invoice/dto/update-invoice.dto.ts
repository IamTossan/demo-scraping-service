import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly supplier?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsDate()
  @IsOptional()
  readonly invoiceDate?: string;
}
