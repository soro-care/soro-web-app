// ============================================
// 📁 FILE: src/app/(client)/psn/apply/page.tsx
// PSN Application Form
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { psnAPI } from '@/lib/api/psn';
import { toast } from 'sonner';

const applicationSchema = z.object({
  motivation: z.string().min(100, 'Please write at least 100 characters about your motivation'),
  availability: z.string().min(20, 'Please describe your availability'),
  experience: z.string().min(50, 'Please describe any relevant experience'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  agreeToPayment: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the payment requirement',
  }),
});

type ApplicationInput = z.infer<typeof applicationSchema>;

export default function PSNApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      agreeToTerms: false,
      agreeToPayment: false,
    },
  });

  const agreeToTerms = watch('agreeToTerms');
  const agreeToPayment = watch('agreeToPayment');

  const onSubmit = async (data: ApplicationInput) => {
    setIsSubmitting(true);
    try {
      await psnAPI.apply({
        motivation: data.motivation,
        availability: data.availability,
        experience: data.experience,
      });

      toast.success('Application submitted successfully!');
      router.push('/psn');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/psn"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to PSN Portal
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Apply to PSN</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Tell us about yourself and why you want to become a peer supporter
        </p>
      </div>

      {/* Application Form */}
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Motivation */}
          <div className="space-y-2">
            <Label htmlFor="motivation">
              Why do you want to become a peer supporter? *
            </Label>
            <Textarea
              id="motivation"
              rows={6}
              placeholder="Share your personal story, experiences, and what motivates you to help others..."
              {...register('motivation')}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimum 100 characters</span>
              <span>{watch('motivation')?.length || 0} characters</span>
            </div>
            {errors.motivation && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.motivation.message}
              </p>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">
              What is your availability for the 8-week training? *
            </Label>
            <Textarea
              id="availability"
              rows={3}
              placeholder="E.g., Weekday evenings, weekends, specific hours per week..."
              {...register('availability')}
              disabled={isSubmitting}
            />
            {errors.availability && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.availability.message}
              </p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">
              Do you have any relevant experience? *
            </Label>
            <Textarea
              id="experience"
              rows={4}
              placeholder="This could include volunteering, counseling, support groups, or personal experiences with mental health..."
              {...register('experience')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Don't worry if you don't have formal experience - lived experience is valuable too!
            </p>
            {errors.experience && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.experience.message}
              </p>
            )}
          </div>

          {/* Payment Notice */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Training Fee: ₦15,000
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              This covers all 8 weeks of training, materials, and certification. Payment is required
              after your application is approved.
            </p>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToPayment"
                checked={agreeToPayment}
                onCheckedChange={(checked) => setValue('agreeToPayment', checked as boolean)}
                disabled={isSubmitting}
              />
              <label
                htmlFor="agreeToPayment"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I understand that payment of ₦15,000 is required to begin training if my
                application is approved
              </label>
            </div>
            {errors.agreeToPayment && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {errors.agreeToPayment.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                disabled={isSubmitting}
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to complete all 8 modules, participate actively in training, and uphold
                SORO's{' '}
                <Link href="/psn/code-of-conduct" className="text-purple-600 hover:underline">
                  Code of Conduct
                </Link>{' '}
                and{' '}
                <Link href="/psn/guidelines" className="text-purple-600 hover:underline">
                  Peer Support Guidelines
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 py-6 text-lg"
            disabled={isSubmitting || !agreeToTerms || !agreeToPayment}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By submitting this application, you acknowledge that all information provided is accurate
            and complete.
          </p>
        </form>
      </Card>
    </div>
  );
}