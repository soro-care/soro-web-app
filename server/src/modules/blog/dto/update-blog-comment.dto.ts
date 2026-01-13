// src/modules/blog/dto/update-blog-comment.dto.ts

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateBlogCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  content?: string;
}
