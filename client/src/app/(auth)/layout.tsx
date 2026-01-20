// ============================================
// 📁 FILE: src/app/(auth)/layout.tsx
// Auth layout with side image
// ============================================

'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                SORO
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Image/Gradient (hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md space-y-6">
            <h2 className="text-4xl font-bold">
              Welcome to Your Safe Space
            </h2>
            <p className="text-lg text-white/90">
              Join thousands finding support, sharing stories, and connecting with mental health professionals.
            </p>
            <div className="flex items-center gap-4 pt-6">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">100% Confidential</div>
                <div className="text-sm text-white/80">HIPAA Compliant & Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}