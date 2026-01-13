// src/modules/availability/availability.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  //   CreateAvailabilityDto,
  UpdateAvailabilityDto,
  BulkUpdateAvailabilityDto,
  CheckSlotDto,
  GetAvailableSlotsDto,
} from './dto';
import { AvailabilityHelpers } from './utils/availability.helpers';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CHECK IF AVAILABILITY IS INITIALIZED
  // ============================================

  async checkInitialized(professionalId: string) {
    const count = await this.prisma.availability.count({
      where: { professional: professionalId },
    });

    return {
      isInitialized: count > 0,
      count,
    };
  }

  // ============================================
  // INITIALIZE AVAILABILITY (EMPTY SCHEDULE)
  // ============================================

  async initializeAvailability(professionalId: string) {
    // Verify user is a professional
    const user = await this.prisma.user.findUnique({
      where: { id: professionalId },
      select: { role: true },
    });

    if (!user || user.role !== 'PROFESSIONAL') {
      throw new ForbiddenException('Only professionals can set availability');
    }

    // Check if already initialized
    const existing = await this.prisma.availability.findFirst({
      where: { professional: professionalId },
    });

    if (existing) {
      throw new ConflictException('Availability already initialized');
    }

    // Create empty availability for all days
    const days = AvailabilityHelpers.getAllDays();
    const availabilities = await Promise.all(
      days.map((day) =>
        this.prisma.availability.create({
          data: {
            professional: professionalId,
            day,
            slots: [],
            available: false,
          },
        }),
      ),
    );

    return {
      message: 'Availability initialized successfully',
      data: availabilities,
    };
  }

  // ============================================
  // GET AVAILABILITY FOR PROFESSIONAL
  // ============================================

  async getAvailability(professionalId: string) {
    const availabilities = await this.prisma.availability.findMany({
      where: { professional: professionalId },
      orderBy: {
        day: 'asc',
      },
    });

    if (availabilities.length === 0) {
      throw new NotFoundException('Availability not initialized. Please initialize first.');
    }

    // Sort by day of week order
    const dayOrder = AvailabilityHelpers.getAllDays();
    const sorted = availabilities.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    return {
      message: 'Availability retrieved successfully',
      data: sorted,
    };
  }

  // ============================================
  // UPDATE AVAILABILITY FOR SPECIFIC DAY
  // ============================================

  async updateAvailability(professionalId: string, dayId: string, dto: UpdateAvailabilityDto) {
    // Find the availability record
    const availability = await this.prisma.availability.findUnique({
      where: { id: dayId },
    });

    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }

    // Verify ownership
    if (availability.professional !== professionalId) {
      throw new ForbiddenException('Not authorized to update this availability');
    }

    // Validate slots if provided
    if (dto.slots) {
      this.validateSlots(dto.slots as any);
    }

    // Determine availability status
    let finalAvailable = dto.available;
    if (dto.slots !== undefined) {
      finalAvailable = dto.slots.length > 0 ? (dto.available ?? true) : false;
    }

    // Update
    const updated = await this.prisma.availability.update({
      where: { id: dayId },
      data: {
        slots: (dto.slots || availability.slots) as any,
        available: finalAvailable ?? availability.available,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Availability updated successfully',
      data: updated,
    };
  }

  // ============================================
  // BULK UPDATE AVAILABILITY
  // ============================================

  async bulkUpdateAvailability(professionalId: string, dto: BulkUpdateAvailabilityDto) {
    // Verify professional
    const user = await this.prisma.user.findUnique({
      where: { id: professionalId },
      select: { role: true },
    });

    if (!user || user.role !== 'PROFESSIONAL') {
      throw new ForbiddenException('Only professionals can set availability');
    }

    // Validate all slots
    dto.availabilities.forEach((avail) => {
      this.validateSlots(avail.slots);
    });

    // Update each day
    const updates = await Promise.all(
      dto.availabilities.map(async (avail) => {
        // Find existing record for this day
        const existing = await this.prisma.availability.findFirst({
          where: {
            professional: professionalId,
            day: avail.day,
          },
        });

        if (existing) {
          // Update existing
          return this.prisma.availability.update({
            where: { id: existing.id },
            data: {
              slots: avail.slots as any,
              available: avail.available,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new
          return this.prisma.availability.create({
            data: {
              professional: professionalId,
              day: avail.day,
              slots: avail.slots as any,
              available: avail.available,
            },
          });
        }
      }),
    );

    return {
      message: 'Availability updated successfully',
      data: updates,
    };
  }

  // ============================================
  // CHECK SPECIFIC SLOT AVAILABILITY
  // ============================================

  async checkSlotAvailability(dto: CheckSlotDto) {
    // Find availability for the day
    const availability = await this.prisma.availability.findFirst({
      where: {
        professional: dto.professionalId,
        day: dto.day,
        available: true,
      },
    });

    if (!availability) {
      return {
        isAvailable: false,
        reason: 'Professional not available on this day',
      };
    }

    // Check if slot exists
    const slots = availability.slots as any[];
    const slotExists = slots.some(
      (slot) => slot.startTime === dto.startTime && slot.endTime === dto.endTime,
    );

    if (!slotExists) {
      return {
        isAvailable: false,
        reason: 'This time slot is not offered',
      };
    }

    // Get professional's pseudonymous ID
    const professional = await this.prisma.user.findUnique({
      where: { id: dto.professionalId },
      select: { pseudonymousId: true },
    });

    // Check if slot is booked
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isBooked = await this.prisma.booking.findFirst({
      where: {
        counselorPseudonymousId: professional.pseudonymousId,
        date: {
          gte: today,
        },
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: {
          in: ['Pending', 'Confirmed', 'Rescheduled'],
        },
      },
    });

    if (isBooked) {
      return {
        isAvailable: false,
        reason: 'This time slot is already booked',
      };
    }

    return {
      isAvailable: true,
      reason: null,
    };
  }

  // ============================================
  // GET ALL AVAILABLE SLOTS
  // ============================================

  async getAllAvailableSlots(query: GetAvailableSlotsDto) {
    // Build where clause
    const where: any = {
      available: true,
    };

    if (query.professionalId) {
      where.professional = query.professionalId;
    }

    if (query.day) {
      where.day = query.day;
    }

    // Get all available days
    const availabilities = await this.prisma.availability.findMany({
      where,
      include: {
        professionalUser: {
          select: {
            id: true,
            pseudonymousId: true,
            name: true,
            avatar: true,
            specialization: true,
            bio: true,
            yearsOfExperience: true,
            isPeerCounselor: true,
            counselorId: true,
          },
        },
      },
    });

    // Get all existing bookings
    const bookings = await this.prisma.booking.findMany({
      where: {
        date: query.date ? new Date(query.date) : { gte: new Date() },
        status: {
          in: ['Pending', 'Confirmed', 'Rescheduled'],
        },
      },
      select: {
        counselorPseudonymousId: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    // Process available slots
    const availableSlots = [];

    for (const avail of availabilities) {
      const slots = avail.slots as any[];
      const nextDate = query.date
        ? new Date(query.date)
        : AvailabilityHelpers.getNextDateForDay(avail.day);

      for (const slot of slots) {
        // Check if slot is booked
        const isBooked = bookings.some(
          (booking) =>
            booking.counselorPseudonymousId === avail.professionalUser.pseudonymousId &&
            AvailabilityHelpers.isSameDay(booking.date, nextDate) &&
            booking.startTime === slot.startTime &&
            booking.endTime === slot.endTime,
        );

        if (!isBooked) {
          availableSlots.push({
            id: `${avail.professional}-${avail.day}-${slot.startTime}`,
            date: nextDate,
            day: avail.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            professional: {
              id: avail.professionalUser.id,
              name: avail.professionalUser.name,
              avatar: avail.professionalUser.avatar,
              specialization: avail.professionalUser.specialization,
              bio: avail.professionalUser.bio,
              yearsOfExperience: avail.professionalUser.yearsOfExperience,
              isPeerCounselor: avail.professionalUser.isPeerCounselor,
              counselorId: avail.professionalUser.counselorId,
            },
          });
        }
      }
    }

    return {
      message: 'Available slots retrieved successfully',
      data: availableSlots,
      total: availableSlots.length,
    };
  }

  // ============================================
  // GET ALL PROFESSIONALS WITH AVAILABILITY
  // ============================================

  async getAllProfessionalsWithAvailability() {
    const professionals = await this.prisma.user.findMany({
      where: {
        role: 'PROFESSIONAL',
        status: 'Active',
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        specialization: true,
        bio: true,
        yearsOfExperience: true,
        isPeerCounselor: true,
        counselorId: true,
        availability: {
          where: {
            available: true,
          },
          select: {
            day: true,
            slots: true,
            available: true,
          },
        },
      },
    });

    return {
      message: 'Professionals with availability retrieved',
      data: professionals,
    };
  }

  // ============================================
  // DELETE AVAILABILITY DAY
  // ============================================

  async deleteAvailabilityDay(professionalId: string, dayId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id: dayId },
    });

    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }

    if (availability.professional !== professionalId) {
      throw new ForbiddenException('Not authorized to delete this availability');
    }

    // Instead of deleting, set to unavailable
    await this.prisma.availability.update({
      where: { id: dayId },
      data: {
        slots: [],
        available: false,
      },
    });

    return {
      message: 'Availability cleared successfully',
    };
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  private validateSlots(slots: { startTime: string; endTime: string }[]) {
    // Validate each slot
    for (const slot of slots) {
      // Check format
      if (
        !AvailabilityHelpers.isValidTimeFormat(slot.startTime) ||
        !AvailabilityHelpers.isValidTimeFormat(slot.endTime)
      ) {
        throw new BadRequestException(`Invalid time format. Use HH:MM (e.g., 09:00)`);
      }

      // Check if end time is after start time
      if (!AvailabilityHelpers.isValidTimeRange(slot.startTime, slot.endTime)) {
        throw new BadRequestException(
          `End time must be after start time for slot ${slot.startTime}-${slot.endTime}`,
        );
      }
    }

    // Check for overlapping slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (
          AvailabilityHelpers.doSlotsOverlap(
            slots[i].startTime,
            slots[i].endTime,
            slots[j].startTime,
            slots[j].endTime,
          )
        ) {
          throw new BadRequestException(
            `Slots ${slots[i].startTime}-${slots[i].endTime} and ${slots[j].startTime}-${slots[j].endTime} overlap`,
          );
        }
      }
    }
  }
}
