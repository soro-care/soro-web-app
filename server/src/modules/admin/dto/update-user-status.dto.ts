// src/modules/admin/dto/update-user-status.dto.ts

import { IsEnum } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(['Active', 'Inactive', 'Suspended'])
  status: string;
}
