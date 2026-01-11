import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(4)
  otp: string;
}
