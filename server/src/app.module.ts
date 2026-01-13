// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { UsersModule } from './modules/users/users.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PSNModule } from './modules/psn/psn.module';
import { BlogModule } from './modules/blog/blog.module';
import { EchoModule } from './modules/echo/echo.module';
import { SurveyModule } from './modules/survey/survey.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Global Modules
    PrismaModule,
    EmailModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    BookingsModule,
    AvailabilityModule,
    NotificationsModule,
    PSNModule,
    BlogModule,
    EchoModule,
    SurveyModule,
    AdminModule,
  ],
})
export class AppModule {}
