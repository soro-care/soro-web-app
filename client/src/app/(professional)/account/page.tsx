// ============================================
// 📁 FILE: src/app/(professional)/profile/page.tsx
// Professional Profile Management - TYPE SAFE VERSION
// ============================================

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User as UserIcon, Briefcase, Upload, Loader2, Save } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { profileAPI } from '@/lib/api/profile';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';
import type { ProfessionalUser } from '@/lib/types';

const professionalProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  mobile: z.string().optional(),
  specialization: z.string().min(5, 'Please specify your specialization'),
  qualifications: z.string().min(10, 'Please list your qualifications'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  yearsOfExperience: z.string().min(1, 'Experience is required'),
});

type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;

export default function ProfessionalProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Type guard to ensure we have a professional user
  const professionalUser = user?.role === 'PROFESSIONAL' ? user as ProfessionalUser : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessionalProfileInput>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      specialization: professionalUser?.specialization || '',
      qualifications: professionalUser?.qualifications?.join(', ') || '',
      bio: professionalUser?.bio || '',
      yearsOfExperience: professionalUser?.yearsOfExperience?.toString() || '0',
    },
  });

  const onSubmit = async (data: ProfessionalProfileInput) => {
    setIsUpdating(true);
    try {
      const updateData = {
        ...data,
        qualifications: data.qualifications.split(',').map((q) => q.trim()),
        yearsOfExperience: parseInt(data.yearsOfExperience),
      };

      const updatedUser = await profileAPI.updateProfile(updateData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await profileAPI.uploadAvatar(file);
      setUser({ ...user!, avatar: avatarUrl });
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user || !professionalUser) return null;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Professional Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your professional information and credentials
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">
            <UserIcon className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="professional">
            <Briefcase className="w-4 h-4 mr-2" />
            Professional Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-semibold mb-2">Profile Picture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  JPG, PNG or GIF. Max 5MB.
                </p>
                <label htmlFor="avatar-upload">
                  <Button variant="outline" size="sm" disabled={isUploadingAvatar} asChild>
                    <span>
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
            </div>

            {/* General Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} disabled={isUpdating} />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register('username')} disabled={isUpdating} />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" type="tel" {...register('mobile')} disabled={isUpdating} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  {isUpdating ? (
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
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="professional">
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="e.g., Clinical Psychology, Anxiety & Depression"
                  {...register('specialization')}
                  disabled={isUpdating}
                />
                {errors.specialization && (
                  <p className="text-sm text-red-600">{errors.specialization.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  rows={3}
                  placeholder="List your qualifications (separated by commas)"
                  {...register('qualifications')}
                  disabled={isUpdating}
                />
                {errors.qualifications && (
                  <p className="text-sm text-red-600">{errors.qualifications.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  e.g., MSc Psychology, Licensed Therapist, CBT Certified
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  max="50"
                  {...register('yearsOfExperience')}
                  disabled={isUpdating}
                />
                {errors.yearsOfExperience && (
                  <p className="text-sm text-red-600">{errors.yearsOfExperience.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  rows={6}
                  placeholder="Tell clients about your approach, experience, and what they can expect from working with you..."
                  {...register('bio')}
                  disabled={isUpdating}
                />
                {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
                <p className="text-xs text-gray-500">Minimum 50 characters</p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  {isUpdating ? (
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
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}