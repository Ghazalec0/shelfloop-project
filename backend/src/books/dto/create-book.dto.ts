import {
  IsString,
  IsInt,
  Min,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsInt()
  @Min(1)
  totalCopies: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
