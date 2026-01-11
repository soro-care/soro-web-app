// src/modules/notifications/notifications.controller.ts

import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetNotificationsQueryDto } from './dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // ============================================
  // GET NOTIFICATIONS
  // ============================================

  @Get()
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationsService.getNotifications(userId, query);
  }

  // ============================================
  // GET UNREAD COUNT
  // ============================================

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return {
      message: 'Unread count retrieved',
      count,
    };
  }

  // ============================================
  // MARK AS READ
  // ============================================

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  // ============================================
  // MARK ALL AS READ
  // ============================================

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  // ============================================
  // DELETE NOTIFICATION
  // ============================================

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }

  // ============================================
  // DELETE ALL READ NOTIFICATIONS
  // ============================================

  @Delete('read/all')
  @HttpCode(HttpStatus.OK)
  async deleteAllReadNotifications(@CurrentUser('userId') userId: string) {
    return this.notificationsService.deleteAllReadNotifications(userId);
  }

  // ============================================
  // CHECK ONLINE STATUS
  // ============================================

  @Get('status/online')
  async checkOnlineStatus(@CurrentUser('userId') userId: string) {
    return {
      isOnline: this.notificationsService.isUserOnline(userId),
      onlineUsers: this.notificationsService.getOnlineUsersCount(),
    };
  }
}
