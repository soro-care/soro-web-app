// ============================================
// 📁 FILE: src/components/shared/PasswordStrength.tsx
// Password strength indicator component
// ============================================

'use client';

import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // No repeating characters
    if (!/(.)\1{2,}/.test(password)) score += 1;
    
    return Math.min(score, 5);
  }, [password]);

  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-muted-foreground">
          Password strength: <span className="font-medium">{getStrengthText()}</span>
        </p>
      )}
    </div>
  );
}