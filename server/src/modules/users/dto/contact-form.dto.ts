// src/modules/users/dto/contact-form.dto.ts
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ContactFormDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}
