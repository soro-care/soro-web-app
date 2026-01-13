// src/modules/blog/dto/update-blog-post.dto.ts

import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(100)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  readTime?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
