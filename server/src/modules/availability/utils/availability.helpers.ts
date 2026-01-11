// src/modules/availability/utils/availability.helpers.ts

export class AvailabilityHelpers {
  /**
   * Get the next occurrence of a specific day of the week
   */
  static getNextDateForDay(dayOfWeek: string): Date {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const targetDayIndex = days.indexOf(dayOfWeek);
    const today = new Date();
    const todayIndex = today.getDay();

    let daysToAdd = targetDayIndex - todayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // Next week if day has passed

    return this.addDays(today, daysToAdd);
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get day of week from date
   */
  static getDayOfWeek(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  }

  /**
   * Validate time slot format (HH:MM)
   */
  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Check if slot times are valid (end time after start time)
   */
  static isValidTimeRange(startTime: string, endTime: string): boolean {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes;
  }

  /**
   * Check if two time slots overlap
   */
  static doSlotsOverlap(
    slot1Start: string,
    slot1End: string,
    slot2Start: string,
    slot2End: string,
  ): boolean {
    const slot1StartMin = this.timeToMinutes(slot1Start);
    const slot1EndMin = this.timeToMinutes(slot1End);
    const slot2StartMin = this.timeToMinutes(slot2Start);
    const slot2EndMin = this.timeToMinutes(slot2End);

    return (
      (slot1StartMin < slot2EndMin && slot1EndMin > slot2StartMin) ||
      (slot2StartMin < slot1EndMin && slot2EndMin > slot1StartMin)
    );
  }

  /**
   * Convert time string to minutes
   */
  static timeToMinutes(time: string): number {
    const [hour, min] = time.split(':').map(Number);
    return hour * 60 + min;
  }

  /**
   * Generate time slots for a duration
   */
  static generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number = 60,
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];
    let currentTime = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    while (currentTime + duration <= endMinutes) {
      const slotStart = this.minutesToTime(currentTime);
      const slotEnd = this.minutesToTime(currentTime + duration);
      slots.push({ startTime: slotStart, endTime: slotEnd });
      currentTime += duration;
    }

    return slots;
  }

  /**
   * Convert minutes to time string
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Get all days of the week
   */
  static getAllDays(): string[] {
    return [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
  }

  /**
   * Sort slots by start time
   */
  static sortSlots(
    slots: { startTime: string; endTime: string }[],
  ): { startTime: string; endTime: string }[] {
    return slots.sort(
      (a, b) =>
        this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime),
    );
  }
}
