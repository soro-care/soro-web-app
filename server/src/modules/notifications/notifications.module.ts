// src/modules/notifications/notifications.module.ts

import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Global() // Make it global so other modules can inject it
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule, // Needed for WebSocket authentication
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
