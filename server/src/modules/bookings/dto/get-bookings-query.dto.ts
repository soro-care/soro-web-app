// src/modules/bookings/dto/create-booking.dto.ts

import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBookingsQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

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
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
