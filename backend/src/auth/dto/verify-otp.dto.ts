import { IsEmail, IsString, Length, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyOtpDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otp: string;
}