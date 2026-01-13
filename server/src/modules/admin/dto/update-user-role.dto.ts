// src/modules/admin/dto/update-user-role.dto.ts

import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(['USER', 'PROFESSIONAL', 'ADMIN', 'SUPERADMIN'])
  role: string;
}
