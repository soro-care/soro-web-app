// src/modules/survey/dto/get-survey-analytics.dto.ts

import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetSurveyAnalyticsDto {
  @IsOptional()
  @IsString()
  ageRange?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  concern?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
