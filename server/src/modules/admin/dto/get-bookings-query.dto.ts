// src/modules/admin/dto/get-bookings-query.dto.ts

import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetBookingsQueryDto {
  @IsOptional()
  @IsEnum(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'])
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
