// src/modules/blog/dto/get-blog-comments-query.dto.ts

import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetBlogCommentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  approved?: boolean;
}
