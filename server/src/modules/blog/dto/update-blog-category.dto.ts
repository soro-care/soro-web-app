// src/modules/blog/dto/update-blog-category.dto.ts

import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateBlogCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
