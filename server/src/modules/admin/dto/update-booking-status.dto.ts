// src/modules/admin/dto/update-booking-status.dto.ts

import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsEnum(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'])
  status: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
