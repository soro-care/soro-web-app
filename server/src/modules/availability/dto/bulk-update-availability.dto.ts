import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAvailabilityDto } from './create-availability.dto';

export class BulkUpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAvailabilityDto)
  availabilities: CreateAvailabilityDto[];
}
