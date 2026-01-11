import {
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TimeSlotDto } from './create-availability.dto';

export class UpdateAvailabilityDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots?: TimeSlotDto[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
