// src/modules/psn/dto/review-application.dto.ts

import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class ReviewApplicationDto {
  @IsEnum(['Accepted', 'Rejected'], {
    message: 'Status must be either Accepted or Rejected',
  })
  status: 'Accepted' | 'Rejected';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNotes?: string;
}
