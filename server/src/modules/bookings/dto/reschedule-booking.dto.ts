// src/modules/users/dto/update-user.dto.ts

import { IsString, IsOptional, Matches, IsDateString } from 'class-validator';

export class RescheduleBookingDto {
  @IsDateString()
  newDate: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  newStartTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  newEndTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
