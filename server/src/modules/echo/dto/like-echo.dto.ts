// src/modules/echo/dto/like-echo.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class LikeEchoDto {
  @IsString()
  @IsNotEmpty()
  storyId: string;
}
