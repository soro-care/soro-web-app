// ============================================
// 📁 FILE: src/app/(client)/onboarding/page.tsx
// Multi-step onboarding screen (mobile-style)
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Users, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const slides = [
    {
      icon: Heart,
      title: 'Welcome to SORO',
      description: 'Your safe space for mental health support and growth. Let\'s get you started!',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Users,
      title: 'Connect with Professionals',
      description: 'Book sessions with certified counselors. Video or audio - your choice.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Shield,
      title: 'Share Anonymously',
      description: 'Echo your story without judgment. Connect with others who understand.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'Grow Together',
      description: 'Join our Peer Support Network and help others while healing yourself.',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/survey'); // Go to survey after onboarding
    }
  };

  const handleSkip = () => {
    router.push('/survey');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex flex-col">
      {/* Skip Button */}
      <div className="safe-top p-4 flex justify-end">
        <Button variant="ghost" onClick={handleSkip} className="text-gray-600 dark:text-gray-400">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${slides[currentStep].gradient} flex items-center justify-center shadow-2xl`}>
              {React.createElement(slides[currentStep].icon, {
                className: 'w-16 h-16 text-white',
              })}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {slides[currentStep].title}
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {slides[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress & Navigation */}
      <div className="safe-bottom pb-8 px-4">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-gradient-to-r from-pink-500 to-purple-600'
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 py-6 text-lg rounded-2xl shadow-lg shadow-purple-500/30"
        >
          {currentStep === slides.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}