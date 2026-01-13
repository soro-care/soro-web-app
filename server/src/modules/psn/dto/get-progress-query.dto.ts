// src/modules/psn/dto/get-progress-query.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class GetProgressQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  cohort?: string;
}
