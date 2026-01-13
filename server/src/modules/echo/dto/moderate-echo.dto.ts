// src/modules/echo/dto/moderate-echo.dto.ts

import { IsBoolean, IsString, IsOptional, MaxLength } from 'class-validator';

export class ModerateEchoDto {
  @IsBoolean()
  moderated: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNote?: string;
}
