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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description:
      'Retrieve paginated notifications for the authenticated user with filtering options',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Number of notifications per page',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['booking', 'system', 'message', 'alert', 'reminder', 'all'],
    example: 'all',
    description: 'Filter notifications by type',
  })
  @ApiQuery({
    name: 'read',
    required: false,
    type: Boolean,
    example: false,
    description: 'Filter by read/unread status',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    format: 'date',
    example: '2024-01-01',
    description: 'Filter notifications from this date',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    format: 'date',
    example: '2024-12-31',
    description: 'Filter notifications up to this date',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'priority', 'read'],
    example: 'createdAt',
    description: 'Sort notifications by field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'notif_abc123def456' },
              type: {
                type: 'string',
                enum: ['booking', 'system', 'message', 'alert', 'reminder'],
                example: 'booking',
              },
              title: { type: 'string', example: 'Booking Confirmed' },
              message: {
                type: 'string',
                example:
                  'Your booking with Dr. Smith has been confirmed for Jan 20, 2024 at 10:00 AM',
              },
              data: {
                type: 'object',
                example: {
                  bookingId: 'booking_123abc',
                  professionalName: 'Dr. Smith',
                  date: '2024-01-20',
                  time: '10:00 AM',
                },
              },
              isRead: { type: 'boolean', example: false },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                example: 'medium',
              },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              readAt: { type: 'string', format: 'date-time', example: null },
              actionUrl: { type: 'string', example: '/bookings/booking_123abc' },
              icon: { type: 'string', example: 'calendar-check' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 45 },
            totalPages: { type: 'number', example: 3 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        unreadCount: { type: 'number', example: 12 },
        summary: {
          type: 'object',
          properties: {
            booking: { type: 'number', example: 5 },
            system: { type: 'number', example: 3 },
            message: { type: 'number', example: 2 },
            alert: { type: 'number', example: 1 },
            reminder: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationsService.getNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description: 'Retrieve the count of unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unread count retrieved' },
        count: { type: 'number', example: 12 },
        breakdown: {
          type: 'object',
          properties: {
            booking: { type: 'number', example: 5 },
            system: { type: 'number', example: 3 },
            message: { type: 'number', example: 2 },
            alert: { type: 'number', example: 1 },
            reminder: { type: 'number', example: 1 },
          },
        },
        lastChecked: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return {
      message: 'Unread count retrieved',
      count,
    };
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Notification ID',
    example: 'notif_abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification marked as read' },
        notificationId: { type: 'string', example: 'notif_abc123def456' },
        readAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00Z' },
        unreadCount: { type: 'number', example: 11 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found or does not belong to user',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Notification is already read',
  })
  async markAsRead(@CurrentUser('userId') userId: string, @Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'All notifications marked as read' },
        markedCount: { type: 'number', example: 12 },
        markedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00Z' },
        unreadCount: { type: 'number', example: 0 },
        affectedTypes: {
          type: 'object',
          properties: {
            booking: { type: 'number', example: 5 },
            system: { type: 'number', example: 3 },
            message: { type: 'number', example: 2 },
            alert: { type: 'number', example: 1 },
            reminder: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'No unread notifications found',
  })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Notification ID',
    example: 'notif_abc123def456',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Notification deleted successfully' },
        notificationId: { type: 'string', example: 'notif_abc123def456' },
        deletedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00Z' },
        totalNotifications: { type: 'number', example: 44 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found or does not belong to user',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete system critical notifications',
  })
  async deleteNotification(
    @CurrentUser('userId') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }

  @Delete('read/all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete all read notifications',
    description: 'Delete all read notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Read notifications deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Read notifications deleted successfully' },
        deletedCount: { type: 'number', example: 20 },
        deletedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00Z' },
        remainingNotifications: { type: 'number', example: 25 },
        breakdown: {
          type: 'object',
          properties: {
            booking: { type: 'number', example: 8 },
            system: { type: 'number', example: 5 },
            message: { type: 'number', example: 4 },
            alert: { type: 'number', example: 2 },
            reminder: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'No read notifications found',
  })
  async deleteAllReadNotifications(@CurrentUser('userId') userId: string) {
    return this.notificationsService.deleteAllReadNotifications(userId);
  }

  @Get('status/online')
  @ApiOperation({
    summary: 'Check user online status',
    description: 'Check if the authenticated user is online and get online users statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Online status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isOnline: { type: 'boolean', example: true },
        onlineUsers: { type: 'number', example: 150 },
        lastSeen: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
        onlineSince: { type: 'string', format: 'date-time', example: '2024-01-15T09:15:00Z' },
        connectionStatus: {
          type: 'string',
          enum: ['connected', 'disconnected', 'idle', 'away'],
          example: 'connected',
        },
        onlineBreakdown: {
          type: 'object',
          properties: {
            professionals: { type: 'number', example: 45 },
            clients: { type: 'number', example: 95 },
            admins: { type: 'number', example: 10 },
          },
        },
        platformStats: {
          type: 'object',
          properties: {
            activeSessions: { type: 'number', example: 120 },
            activeBookings: { type: 'number', example: 25 },
            activeChats: { type: 'number', example: 30 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  async checkOnlineStatus(@CurrentUser('userId') userId: string) {
    return {
      isOnline: this.notificationsService.isUserOnline(userId),
      onlineUsers: this.notificationsService.getOnlineUsersCount(),
    };
  }
}
