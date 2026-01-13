// src/modules/echo/dto/create-echo.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateEchoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Story must be at least 10 characters' })
  @MaxLength(2000, { message: 'Story cannot exceed 2000 characters' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(30, { message: 'Display name cannot exceed 30 characters' })
  authorName: string;

  @IsEnum(
    [
      'pressure',
      'burnout',
      'not-enough',
      'silence',
      'rage',
      'exhaustion',
      'gratitude',
      'victory',
      'hope',
      'resilience',
    ],
    { message: 'Invalid room selected' },
  )
  room: string;
}
