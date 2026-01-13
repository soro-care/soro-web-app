// src/modules/auth/dto/register.dto.ts

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @Matches(
    /^[0-9]{1,2}-[0-9]{1,2}[a-z]{2}[0-9]+@students\.unilorin\.edu\.ng$/i,
    {
      message:
        'Only accessible to students of University of Ilorin – please enter your student email.',
    },
  )
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;
}
