// src/modules/psn/dto/update-module.dto.ts

import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  content?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  order?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  weekNumber?: number;

  @IsOptional()
  @IsDateString()
  unlockDate?: string;
}
