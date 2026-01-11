import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class VerifyResetOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
