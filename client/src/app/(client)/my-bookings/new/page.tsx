// ============================================
// 📁 FILE: src/app/(client)/bookings/new/page.tsx
// Multi-step booking form
// ============================================

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Video, Mic, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { bookingsAPI } from '@/lib/api/bookings';
import type { Professional } from '@/lib/api/bookings';

const bookingSchema = z.object({
  professionalId: z.string().min(1, 'Please select a professional'),
  date: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a time'),
  modality: z.enum(['Video', 'Audio']),
  concern: z.string().min(10, 'Please describe your concern (min 10 characters)'),
  notes: z.string().optional(),
});

type BookingInput = z.infer<typeof bookingSchema>;

export default function NewBookingPage() {
  const [step, setStep] = useState(1);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      modality: 'Video',
    },
  });

  const selectedModality = watch('modality');
  const selectedDate = watch('date');

  // Fetch professionals on mount
  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const data = await bookingsAPI.getProfessionals();
      setProfessionals(data);
    } catch (error) {
      toast.error('Failed to load professionals');
    }
  };

  const handleSelectProfessional = async (professional: Professional) => {
    setSelectedProfessional(professional);
    setValue('professionalId', professional.id);
    
    // Load availability
    try {
      const availability = await bookingsAPI.getAvailability(professional.id);
      // Process availability to get dates
      setAvailableDates(getNext7Days());
    } catch (error) {
      toast.error('Failed to load availability');
    }
  };

  const handleSelectDate = (date: string) => {
    setValue('date', date);
    // Load times for selected date
    setAvailableTimes([
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ]);
  };

  const handleSelectTime = (time: string) => {
    setValue('startTime', time);
  };

  const getNext7Days = useCallback(() => {
  const dates = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}, []);

  const onSubmit = async (data: BookingInput) => {
    setIsSubmitting(true);
    try {
      await bookingsAPI.createBooking({
        ...data,
        endTime: calculateEndTime(data.startTime),
      });
      
      toast.success('Booking request submitted successfully!');
      router.push('/bookings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select a Professional</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose a mental health professional that fits your needs
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name or specialization..."
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
              {professionals.map((pro) => (
                <Card
                  key={pro.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedProfessional?.id === pro.id
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleSelectProfessional(pro)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {pro.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{pro.name}</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                        {pro.specialization}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {pro.bio}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pro.yearsOfExperience}+ years experience
                      </p>
                    </div>

                    {selectedProfessional?.id === pro.id && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Date & Time</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select when you'd like to have your session
              </p>
            </div>

            <div>
              <Label className="mb-3 block">Select Date</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    type="button"
                    variant={selectedDate === date ? 'default' : 'outline'}
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => handleSelectDate(date)}
                  >
                    <span className="text-xs opacity-70">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(date).getDate()}
                    </span>
                    <span className="text-xs opacity-70">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </Button>
                ))}
              </div>
              {errors.date && (
                <p className="text-sm text-red-600 mt-2">{errors.date.message}</p>
              )}
            </div>

            {selectedDate && (
              <div>
                <Label className="mb-3 block">Select Time</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={watch('startTime') === time ? 'default' : 'outline'}
                      onClick={() => handleSelectTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {errors.startTime && (
                  <p className="text-sm text-red-600 mt-2">{errors.startTime.message}</p>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Session Details</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us more about what you'd like to discuss
              </p>
            </div>

            <div className="space-y-2">
              <Label>Session Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={selectedModality === 'Video' ? 'default' : 'outline'}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setValue('modality', 'Video')}
                >
                  <Video className="w-6 h-6" />
                  <span>Video Call</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedModality === 'Audio' ? 'default' : 'outline'}
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setValue('modality', 'Audio')}
                >
                  <Mic className="w-6 h-6" />
                  <span>Audio Call</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concern">What would you like to discuss? *</Label>
              <Textarea
                id="concern"
                rows={4}
                placeholder="E.g., I've been feeling anxious lately..."
                {...register('concern')}
              />
              {errors.concern && (
                <p className="text-sm text-red-600">{errors.concern.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Any other information you'd like to share..."
                {...register('notes')}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Please review your booking details
              </p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <Label className="text-xs text-gray-500">Professional</Label>
                <p className="font-semibold">{selectedProfessional?.name}</p>
                <p className="text-sm text-gray-600">{selectedProfessional?.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Date</Label>
                  <p className="font-semibold">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Time</Label>
                  <p className="font-semibold">{watch('startTime')}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Session Type</Label>
                <p className="font-semibold">{selectedModality} Call</p>
              </div>

              <div>
                <Label className="text-xs text-gray-500">Concern</Label>
                <p className="text-sm">{watch('concern')}</p>
              </div>

              {watch('notes') && (
                <div>
                  <Label className="text-xs text-gray-500">Additional Notes</Label>
                  <p className="text-sm">{watch('notes')}</p>
                </div>
              )}
            </Card>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Your booking will be pending until confirmed by the professional. 
                You'll receive an email notification once it's confirmed.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedProfessional;
      case 2:
        return !!(watch('date') && watch('startTime'));
      case 3:
        return !!(watch('concern') && watch('concern').length >= 10);
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  s === step
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all ${
                    s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-600 dark:text-gray-400">
          <span>Professional</span>
          <span>Date & Time</span>
          <span>Details</span>
          <span>Confirm</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 md:p-8 mb-6">{renderStep()}</Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="flex-1"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}