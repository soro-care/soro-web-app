import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsOptional()
  @IsString()
  professionalId?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ])
  day?: string;
}
