// src/modules/notifications/dto/create-notification.dto.ts

import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsOptional()
  @IsString()
  sender?: string;

  @IsOptional()
  @IsString()
  booking?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;
}
