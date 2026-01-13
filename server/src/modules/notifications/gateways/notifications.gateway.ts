// src/modules/notifications/gateways/notifications.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'https://soro.care', 'https://www.soro.care'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socket IDs

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ============================================
  // CONNECTION HANDLING
  // ============================================

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      // Verify token
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = decoded.userId;

      // Store socket for this user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      // Join user-specific room
      void client.join(`user:${userId}`);

      // Store userId in socket data
      client.data.userId = userId;

      this.logger.log(
        `Client ${client.id} connected for user ${userId}. Total connections: ${this.userSockets.get(userId).size}`,
      );

      // Send connection success
      client.emit('connected', {
        message: 'Connected to notifications',
        userId,
      });
    } catch (error) {
      this.logger.error(`Connection error for ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);

      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }

      this.logger.log(`Client ${client.id} disconnected for user ${userId}`);
    }
  }

  // ============================================
  // MESSAGE HANDLERS
  // ============================================

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    this.logger.log(`User ${userId} subscribed to notifications`);
    return {
      event: 'subscribed',
      data: { message: 'Successfully subscribed to notifications' },
    };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return {
      event: 'pong',
      data: { timestamp: new Date().toISOString() },
    };
  }

  // ============================================
  // EMIT NOTIFICATION TO USER
  // ============================================

  sendNotificationToUser(userId: string, notification: any) {
    const room = `user:${userId}`;

    this.server.to(room).emit('notification', notification);

    this.logger.log(`Notification sent to user ${userId}`);
  }

  // ============================================
  // BROADCAST TO MULTIPLE USERS
  // ============================================

  sendNotificationToMultipleUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // ============================================
  // CHECK IF USER IS ONLINE
  // ============================================

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  // ============================================
  // GET ONLINE USERS COUNT
  // ============================================

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // ============================================
  // GET USER'S ACTIVE CONNECTIONS
  // ============================================

  getUserConnectionsCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }
}
