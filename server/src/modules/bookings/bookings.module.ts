// src/modules/bookings/bookings.module.ts

import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { MeetingGeneratorService } from './utils/meeting-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, EmailModule, AuthModule],
  controllers: [BookingsController],
  providers: [BookingsService, MeetingGeneratorService],
  exports: [BookingsService, MeetingGeneratorService],
})
export class BookingsModule {}
