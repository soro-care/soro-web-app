// src/modules/echo/dto/get-echoes-query.dto.ts

import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetEchoesQueryDto {
  @IsOptional()
  @IsEnum([
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
  ])
  room?: string;

  @IsOptional()
  @IsEnum(['struggle', 'positive', 'neutral'])
  sentiment?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  moderated?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  crisisFlag?: boolean;
}
