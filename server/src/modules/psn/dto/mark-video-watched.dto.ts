// src/modules/psn/dto/mark-video-watched.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';

export class MarkVideoWatchedDto {
  @IsString()
  @IsNotEmpty()
  moduleId: string;
}
