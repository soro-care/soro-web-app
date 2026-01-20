// ============================================
// 📁 FILE: src/app/(client)/echo/share/page.tsx
// Share Story Page
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, AlertCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { echoAPI, type EchoRoom } from '@/lib/api/echo';
import { toast } from 'sonner';

const shareStorySchema = z.object({
  content: z
    .string()
    .min(50, 'Story must be at least 50 characters')
    .max(2000, 'Story must not exceed 2000 characters'),
  authorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name is too long'),
  room: z.string().min(1, 'Please select a room'),
});

type ShareStoryInput = z.infer<typeof shareStorySchema>;

export default function ShareStoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ShareStoryInput>({
    resolver: zodResolver(shareStorySchema),
  });

  const content = watch('content') || '';
  const selectedRoom = watch('room');

  const rooms = [
    { id: 'pressure', name: 'Pressure', category: 'struggle' },
    { id: 'burnout', name: 'Burnout', category: 'struggle' },
    { id: 'not_enough', name: 'Not Enough', category: 'struggle' },
    { id: 'silence', name: 'Silence', category: 'struggle' },
    { id: 'rage', name: 'Rage', category: 'struggle' },
    { id: 'exhaustion', name: 'Exhaustion', category: 'struggle' },
    { id: 'gratitude', name: 'Gratitude', category: 'positive' },
    { id: 'victory', name: 'Victory', category: 'positive' },
    { id: 'hope', name: 'Hope', category: 'positive' },
    { id: 'resilience', name: 'Resilience', category: 'positive' },
  ];

  const onSubmit = async (data: ShareStoryInput) => {
    setIsSubmitting(true);
    try {
      await echoAPI.shareStory({
        content: data.content,
        authorName: data.authorName,
        room: data.room as EchoRoom,
      });

      toast.success('Story shared successfully!');
      router.push(`/echo/${data.room}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to share story');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back Link */}
      <Link
        href="/echo"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Echo
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Share Your Story</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your story matters. Share anonymously in a safe space.
        </p>
      </div>

      {/* Form */}
      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Anonymous Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Anonymous Name *</Label>
            <Input
              id="authorName"
              placeholder="e.g., Hope Seeker, Brave Soul"
              {...register('authorName')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose a pseudonym to protect your identity
            </p>
            {errors.authorName && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.authorName.message}
              </p>
            )}
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">Which room best fits your story? *</Label>
            <Select
              value={selectedRoom}
              onValueChange={(value) => setValue('room', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  When You&apos;re Struggling
                </div>
                {rooms
                  .filter((r) => r.category === 'struggle')
                  .map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">
                  Celebrating Moments
                </div>
                {rooms
                  .filter((r) => r.category === 'positive')
                  .map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.room && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.room.message}</p>
            )}
          </div>

          {/* Story Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Story *</Label>
            <Textarea
              id="content"
              rows={12}
              placeholder="Share your thoughts, feelings, or experiences. This is a judgment-free space..."
              {...register('content')}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Minimum 50 characters</span>
              <span
                className={
                  content.length > 2000 ? 'text-red-600 dark:text-red-400' : ''
                }
              >
                {content.length} / 2000
              </span>
            </div>
            {errors.content && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">Community Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be respectful and supportive</li>
                  <li>• No hate speech or harassment</li>
                  <li>• Keep personal details private</li>
                  <li>• If in crisis, please contact 988 or SafeSpace AI</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 py-6 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sharing Story...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Share Story
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Your story will be reviewed for safety before being published
          </p>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold mb-2">Why Share Anonymously?</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Many people find it easier to open up when their identity is protected. Your story
          might help someone else feel less alone.
        </p>
        <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
          <Heart className="w-4 h-4" />
          <span>Your vulnerability is your strength</span>
        </div>
      </Card>
    </div>
  );
}
