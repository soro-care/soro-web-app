// src/modules/echo/dto/share-echo.dto.ts

import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ShareEchoDto {
  @IsString()
  @IsNotEmpty()
  storyId: string;

  @IsEnum(['twitter', 'facebook', 'whatsapp', 'copy'], {
    message: 'Invalid platform',
  })
  platform: string;
}
