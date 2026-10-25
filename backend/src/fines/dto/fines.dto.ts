import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PayFineDto {
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}