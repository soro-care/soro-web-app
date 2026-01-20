// ============================================
// 📁 FILE: src/app/(professional)/availability/page.tsx
// Professional Availability Management
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Clock, Save, Copy, Trash2, Plus, Loader2, Check } from 'lucide-react';
import { professionalAPI, type DayAvailability, type TimeSlot } from '@/lib/api/professional';
import { toast } from 'sonner';

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
  ];

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setIsLoading(true);
      const data = await professionalAPI.getMyAvailability();
      
      if (data.length === 0) {
        // Initialize with default availability
        await professionalAPI.initializeAvailability();
        const newData = await professionalAPI.getMyAvailability();
        setAvailability(newData);
      } else {
        setAvailability(data);
      }
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const updated = [...availability];
    updated[dayIndex] = {
      ...updated[dayIndex],
      available: !updated[dayIndex].available,
    };
    setAvailability(updated);
    setHasChanges(true);
  };

  const toggleTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...availability];
    const slots = Array.isArray(updated[dayIndex].slots) 
      ? updated[dayIndex].slots 
      : [];
    
    if (slots[slotIndex]) {
      slots[slotIndex] = {
        ...slots[slotIndex],
        available: !slots[slotIndex].available,
      };
      updated[dayIndex].slots = slots;
      setAvailability(updated);
      setHasChanges(true);
    }
  };

  const copyDay = (fromDayIndex: number) => {
    if (!window.confirm(`Copy ${daysOfWeek[fromDayIndex]}'s schedule to other days?`)) {
      return;
    }

    const updated = availability.map((day, index) => {
      if (index === fromDayIndex) return day;
      return {
        ...day,
        available: availability[fromDayIndex].available,
        slots: JSON.parse(JSON.stringify(availability[fromDayIndex].slots)),
      };
    });

    setAvailability(updated);
    setHasChanges(true);
    toast.success('Schedule copied to all days');
  };

  const clearDay = (dayIndex: number) => {
    if (!window.confirm(`Clear all time slots for ${daysOfWeek[dayIndex]}?`)) {
      return;
    }

    const updated = [...availability];
    updated[dayIndex] = {
      ...updated[dayIndex],
      available: false,
      slots: updated[dayIndex].slots.map(slot => ({
        ...slot,
        available: false,
      })),
    };

    setAvailability(updated);
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    setIsSaving(true);
    try {
      const updates = availability.map((day) => ({
        dayId: day.id,
        data: {
          available: day.available,
          slots: day.slots,
        },
      }));

      await professionalAPI.bulkUpdateAvailability(updates);
      toast.success('Availability updated successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save availability');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Availability Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set your weekly schedule and available time slots
          </p>
        </div>

        {hasChanges && (
          <Button
            onClick={saveAvailability}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              How It Works
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Toggle days on/off to set which days you&apos;re available</li>
              <li>• Click time slots to mark them as available for bookings</li>
              <li>• Use &quot;Copy to All&quot; to quickly apply one day&apos;s schedule to all days</li>
              <li>• Changes are saved only when you click &quot;Save Changes&quot;</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        {daysOfWeek.map((dayName, dayIndex) => {
          const day = availability[dayIndex];
          if (!day) return null;

          const slots = Array.isArray(day.slots) ? day.slots : [];

          return (
            <Card key={dayName} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={day.available}
                    onCheckedChange={() => toggleDay(dayIndex)}
                  />
                  <div>
                    <Label className="text-lg font-semibold">{dayName}</Label>
                    <p className="text-sm text-gray-500">
                      {slots.filter((s) => s.available).length} slots available
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyDay(dayIndex)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearDay(dayIndex)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {day.available && (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {slots.map((slot, slotIndex) => (
                    <Button
                      key={slotIndex}
                      variant={slot.available ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTimeSlot(dayIndex, slotIndex)}
                      className={
                        slot.available
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                          : ''
                      }
                    >
                      {slot.available && <Check className="w-3 h-3 mr-1" />}
                      {slot.startTime}
                    </Button>
                  ))}
                </div>
              )}

              {!day.available && (
                <div className="text-center py-8 text-gray-500">
                  Toggle the switch above to set availability for this day
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Save Button (Bottom) */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-center">
          <Button
            onClick={saveAvailability}
            disabled={isSaving}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
