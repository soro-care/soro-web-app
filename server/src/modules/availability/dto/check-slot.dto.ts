import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CheckSlotDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

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

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}
