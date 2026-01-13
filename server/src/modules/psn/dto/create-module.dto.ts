// src/modules/psn/dto/create-module.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  content: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  order: number;

  @IsNumber()
  @Min(1)
  @Max(4)
  weekNumber: number;

  @IsDateString()
  unlockDate: string;
}
