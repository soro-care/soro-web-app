// src/modules/bookings/utils/meeting-generator.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingGeneratorService {
  private readonly logger = new Logger(MeetingGeneratorService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate a Zoom meeting link
   * For now, this returns a placeholder. You can integrate with Zoom API later.
   */
  async generateZoomLink(
    topic: string,
    duration: number,
    startTime: string,
  ): Promise<{
    join_url: string;
    password: string;
    id: string;
  }> {
    // TODO: Implement actual Zoom API integration
    // For now, return a placeholder structure

    const meetingId = this.generateMeetingId();
    const password = this.generatePassword();

    this.logger.log(`Generated Zoom meeting: ${meetingId}`);

    return {
      id: meetingId,
      join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      password: password,
    };
  }

  /**
   * Generate Google Meet link
   */
  async generateGoogleMeetLink(
    topic: string,
    duration: number,
    startTime: string,
  ): Promise<{
    join_url: string;
    id: string;
  }> {
    // TODO: Implement Google Meet API integration
    const meetingId = this.generateMeetingId();

    this.logger.log(`Generated Google Meet: ${meetingId}`);

    return {
      id: meetingId,
      join_url: `https://meet.google.com/${meetingId}`,
    };
  }

  /**
   * Generate a generic meeting room
   * This is a fallback for free tier - just creates a unique room ID
   */
  generateSimpleMeetingRoom(): {
    join_url: string;
    password: string;
    id: string;
  } {
    const roomId = this.generateMeetingId();
    const password = this.generatePassword();

    // You can use services like Jitsi Meet, Whereby, or Daily.co (all have free tiers)
    return {
      id: roomId,
      join_url: `https://meet.jit.si/soro-session-${roomId}`, // Jitsi is free!
      password: password,
    };
  }

  /**
   * Add alternative hosts to Zoom meeting (for anonymity in peer counseling)
   */
  async addAlternativeHosts(
    meetingId: string,
    emails: string[],
  ): Promise<boolean> {
    // TODO: Implement with actual Zoom API
    this.logger.log(`Added alternative hosts to meeting ${meetingId}`);
    return true;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private generateMeetingId(): string {
    // Generate 11-digit meeting ID
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  }

  private generatePassword(): string {
    // Generate 6-character alphanumeric password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Calculate duration in minutes between two times
   */
  calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes - startMinutes;
  }
}
