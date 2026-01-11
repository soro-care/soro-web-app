// src/modules/users/dto/get-users-query.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
