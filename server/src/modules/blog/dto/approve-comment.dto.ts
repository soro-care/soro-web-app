// src/modules/blog/dto/approve-comment.dto.ts

import { IsBoolean } from 'class-validator';

export class ApproveCommentDto {
  @IsBoolean()
  approved: boolean;
}
