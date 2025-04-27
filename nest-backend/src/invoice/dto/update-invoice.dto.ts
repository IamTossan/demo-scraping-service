import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly supplier?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsDateString()
  @IsOptional()
  readonly invoiceDate?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly amountExclTax?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly amountTax?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly amountTotal?: number;
}
