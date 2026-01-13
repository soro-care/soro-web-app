// src/modules/echo/dto/report-echo.dto.ts

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ReportEchoDto {
  @IsString()
  @IsNotEmpty()
  storyId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
