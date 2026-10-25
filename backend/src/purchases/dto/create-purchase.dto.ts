import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsInt, Min } from 'class-validator';

export enum PaymentMethod {
  CARD = 'CARD',
  WALLET = 'WALLET',
  CASH = 'CASH',
}

export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;
}