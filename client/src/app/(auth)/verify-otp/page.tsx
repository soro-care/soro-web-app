// src/app/(auth)/verify-otp/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, type OTPInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import { authAPI } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Create a component that uses useSearchParams
function VerifyOTPContent() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOTP, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email,
      otp: '',
    },
  });

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);
    setValue('otp', newOtpValues.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtpValues = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtpValues(newOtpValues);
    setValue('otp', newOtpValues.join(''));

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const onSubmit = async (data: OTPInput) => {
    try {
      await verifyOTP(data);
      router.push('/dashboard');
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      await authAPI.resendOTP(email);
      toast.success('OTP sent! Check your email.');
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <Mail className="w-16 h-16 mx-auto text-gray-400" />
        <h2 className="text-2xl font-bold">Email Required</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please start from the registration page.
        </p>
        <Link href="/register">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            Go to Register
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/register"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to register
        </Link>
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          We sent a 6-digit code to
          <br />
          <span className="font-medium text-gray-900 dark:text-white">
            {email}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {otpValues.map((value, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold"
                disabled={isLoading}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-base font-medium rounded-xl shadow-lg shadow-purple-500/30"
          disabled={isLoading || otpValues.join('').length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        {/* Resend OTP */}
        <div className="text-center text-sm">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">
              Resend OTP in{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {countdown}s
              </span>
            </span>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed text-center">
            <strong>Security Tip:</strong> Never share your OTP with anyone. 
            SORO staff will never ask for your verification code.
          </p>
        </div>
      </form>
    </div>
  );
}

// Main component with Suspense
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}