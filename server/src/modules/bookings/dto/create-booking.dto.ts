// src/modules/bookings/dto/create-booking.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { BookingModality } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsDateString()
  date: string; // ISO date string

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @IsEnum(BookingModality)
  modality: BookingModality;

  @IsString()
  @IsNotEmpty()
  concern: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
