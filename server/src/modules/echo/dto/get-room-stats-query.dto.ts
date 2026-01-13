// src/modules/echo/dto/get-room-stats-query.dto.ts

import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRoomStatsQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeTrending?: boolean;
}
