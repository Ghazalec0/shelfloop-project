
import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsNumber,
} from 'class-validator';

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

  @IsInt()
  @Min(1)
  @IsOptional()
  totalCopies?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
