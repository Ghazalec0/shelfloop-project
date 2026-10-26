import { IsString, IsInt, Min, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  totalCopies?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
