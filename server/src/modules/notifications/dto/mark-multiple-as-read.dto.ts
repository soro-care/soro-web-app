import { IsOptional, IsArray, IsString } from 'class-validator';

export class MarkMultipleAsReadDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationIds?: string[];
}
