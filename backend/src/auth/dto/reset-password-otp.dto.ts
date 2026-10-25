import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordOtpDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password too weak',
  })
  newPassword: string;
}