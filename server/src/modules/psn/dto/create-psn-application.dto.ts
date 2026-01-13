// src/modules/psn/dto/create-psn-application.dto.ts

import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreatePSNApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Motivation must be at least 50 characters' })
  @MaxLength(1000, { message: 'Motivation cannot exceed 1000 characters' })
  motivation: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, {
    message: 'Availability details must be at least 20 characters',
  })
  @MaxLength(500)
  availability: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Experience must be at least 20 characters' })
  @MaxLength(1000)
  experience: string;
}
