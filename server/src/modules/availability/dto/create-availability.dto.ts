// src/modules/availability/dto/create-availability.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  @IsNotEmpty()
  startTime: string; // HH:MM format

  @IsString()
  @IsNotEmpty()
  endTime: string; // HH:MM format
}

export class CreateAvailabilityDto {
  @IsEnum([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ])
  day: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];

  @IsBoolean()
  available: boolean;
}
