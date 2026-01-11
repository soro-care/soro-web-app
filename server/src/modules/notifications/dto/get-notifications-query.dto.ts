import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetNotificationsQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
