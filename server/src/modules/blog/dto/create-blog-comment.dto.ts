// src/modules/blog/dto/create-blog-comment.dto.ts

import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateBlogCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  postId: string;
}
