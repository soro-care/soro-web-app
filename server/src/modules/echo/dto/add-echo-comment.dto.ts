// src/modules/echo/dto/add-echo-comment.dto.ts

import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class AddEchoCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Comment must be at least 3 characters' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(30, { message: 'Display name cannot exceed 30 characters' })
  username: string;

  @IsString()
  @IsNotEmpty()
  storyId: string;
}
