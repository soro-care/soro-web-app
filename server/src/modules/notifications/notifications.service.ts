// src/modules/notifications/notifications.service.ts

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { CreateNotificationDto, GetNotificationsQueryDto } from './dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ============================================
  // CREATE NOTIFICATION
  // ============================================

  async createNotification(dto: CreateNotificationDto) {
    // Create notification in database
    const notification = await this.prisma.notification.create({
      data: {
        recipient: dto.recipient,
        sender: dto.sender,
        booking: dto.booking,
        type: dto.type,
        message: dto.message,
        isRead: false,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        bookingRel: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
      },
    });

    // Send real-time notification via WebSocket
    this.notificationsGateway.sendNotificationToUser(dto.recipient, {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      sender: notification.senderUser,
      booking: notification.bookingRel,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    this.logger.log(`Notification created for user ${dto.recipient}: ${dto.type}`);

    return notification;
  }

  // ============================================
  // GET USER NOTIFICATIONS
  // ============================================

  async getNotifications(userId: string, query: GetNotificationsQueryDto) {
    const { isRead, limit = 20, page = 1 } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      recipient: userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    // Get notifications and count
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          senderUser: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isPeerCounselor: true,
            },
          },
          bookingRel: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              status: true,
              modality: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      message: 'Notifications retrieved successfully',
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount: await this.getUnreadCount(userId),
      },
    };
  }

  // ============================================
  // MARK AS READ
  // ============================================

  async markAsRead(userId: string, notificationId: string) {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipient !== userId) {
      throw new ForbiddenException('Not authorized to update this notification');
    }

    // Update notification
    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    // Send real-time update
    this.notificationsGateway.sendNotificationToUser(userId, {
      event: 'notification_read',
      notificationId,
      unreadCount: await this.getUnreadCount(userId),
    });

    return {
      message: 'Notification marked as read',
      data: updated,
    };
  }

  // ============================================
  // MARK ALL AS READ
  // ============================================

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        recipient: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Send real-time update
    this.notificationsGateway.sendNotificationToUser(userId, {
      event: 'all_notifications_read',
      unreadCount: 0,
    });

    return {
      message: 'All notifications marked as read',
    };
  }

  // ============================================
  // DELETE NOTIFICATION
  // ============================================

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipient !== userId) {
      throw new ForbiddenException('Not authorized to delete this notification');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    // Send real-time update
    this.notificationsGateway.sendNotificationToUser(userId, {
      event: 'notification_deleted',
      notificationId,
      unreadCount: await this.getUnreadCount(userId),
    });

    return {
      message: 'Notification deleted successfully',
    };
  }

  // ============================================
  // DELETE ALL READ NOTIFICATIONS
  // ============================================

  async deleteAllReadNotifications(userId: string) {
    await this.prisma.notification.deleteMany({
      where: {
        recipient: userId,
        isRead: true,
      },
    });

    return {
      message: 'All read notifications deleted',
    };
  }

  // ============================================
  // GET UNREAD COUNT
  // ============================================

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipient: userId,
        isRead: false,
      },
    });
  }

  // ============================================
  // NOTIFICATION HELPERS (Used by other modules)
  // ============================================

  async notifyBookingRequest(
    professionalId: string,
    userId: string,
    bookingId: string,
    userName: string,
  ) {
    await this.createNotification({
      recipient: professionalId,
      sender: userId,
      booking: bookingId,
      type: NotificationType.BookingRequest,
      message: `New booking request from ${userName}`,
    });
  }

  async notifyBookingConfirmed(
    userId: string,
    professionalId: string,
    bookingId: string,
    professionalName: string,
  ) {
    await this.createNotification({
      recipient: userId,
      sender: professionalId,
      booking: bookingId,
      type: NotificationType.BookingConfirmed,
      message: `Your booking with ${professionalName} has been confirmed`,
    });
  }

  async notifyBookingCancelled(
    recipientId: string,
    senderId: string,
    bookingId: string,
    message: string,
  ) {
    await this.createNotification({
      recipient: recipientId,
      sender: senderId,
      booking: bookingId,
      type: NotificationType.BookingCancelled,
      message,
    });
  }

  async notifyBookingRescheduled(
    userId: string,
    professionalId: string,
    bookingId: string,
    newDate: string,
    newTime: string,
  ) {
    await this.createNotification({
      recipient: userId,
      sender: professionalId,
      booking: bookingId,
      type: NotificationType.BookingRescheduled,
      message: `Your booking has been rescheduled to ${newDate} at ${newTime}`,
    });
  }

  async notifyBookingCompleted(userId: string, professionalId: string, bookingId: string) {
    await this.createNotification({
      recipient: userId,
      sender: professionalId,
      booking: bookingId,
      type: NotificationType.BookingCompleted,
      message: `Your session has been completed`,
    });
  }

  // ============================================
  // WEBSOCKET STATUS
  // ============================================

  isUserOnline(userId: string): boolean {
    return this.notificationsGateway.isUserOnline(userId);
  }

  getOnlineUsersCount(): number {
    return this.notificationsGateway.getOnlineUsersCount();
  }
}
