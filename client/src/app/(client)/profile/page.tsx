// ============================================
// 📁 FILE: src/app/(client)/profile/page.tsx
// Profile Management Page
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Bell,
  Heart,
  Upload,
  Loader2,
  Trash2,
  Plus,
  Save,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { profileAPI } from '@/lib/api/profile';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmergencyContact, ProfileFormData, EmergencyContactFormData, ApiError } from '@/types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  relationship: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  canBeContacted: z.boolean(),
});

type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    },
  });

  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    formState: { errors: contactErrors },
    reset: resetContact,
    setValue: setContactValue,
    watch: watchContact,
  } = useForm<EmergencyContactInput>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      canBeContacted: true,
    },
  });

  const canBeContacted = watchContact('canBeContacted');

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async (): Promise<void> => {
    try {
      const contacts = await profileAPI.getEmergencyContacts();
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Failed to load emergency contacts');
      toast.error('Failed to load emergency contacts');
    }
  };

  const onSubmitProfile = async (data: ProfileFormData): Promise<void> => {
    setIsUpdating(true);
    try {
      const updatedUser = await profileAPI.updateProfile(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
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
      if (user) {
        setUser({ ...user, avatar: avatarUrl });
      }
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmitContact = async (data: EmergencyContactFormData): Promise<void> => {
    setIsAddingContact(true);
    try {
      await profileAPI.addEmergencyContact(data);
      toast.success('Emergency contact added!');
      setAddContactDialogOpen(false);
      resetContact();
      loadEmergencyContacts();
    } catch (error) {
      toast.error('Failed to add contact');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string): Promise<void> => {
    try {
      await profileAPI.deleteEmergencyContact(contactId);
      toast.success('Contact removed');
      loadEmergencyContacts();
    } catch (error) {
      toast.error('Failed to remove contact');
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account and privacy settings
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <UserIcon className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <Heart className="w-4 h-4 mr-2" />
            Emergency
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card className="p-6">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-semibold mb-2">Profile Picture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  JPG, PNG or GIF. Max 5MB.
                </p>
                <div className="flex gap-2">
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
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    disabled={isUpdating}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register('username')}
                    disabled={isUpdating}
                  />
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
                  <Label htmlFor="mobile">Mobile (Optional)</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    {...register('mobile')}
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
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

        {/* Emergency Contacts Tab */}
        <TabsContent value="emergency">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Emergency Contacts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  People we can contact if you&apos;re in crisis
                </p>
              </div>
              <Button
                onClick={() => setAddContactDialogOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{contact.name}</h4>
                      {contact.relationship && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {contact.relationship}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}

              {emergencyContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No emergency contacts added yet</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Your data is protected under HIPAA regulations
            </p>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Emergency Contact Dialog */}
      <Dialog open={addContactDialogOpen} onOpenChange={setAddContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>
              Add someone we can contact if you&apos;re in crisis
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitContact(onSubmitContact)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name *</Label>
              <Input
                id="contactName"
                {...registerContact('name')}
                placeholder="Full name"
              />
              {contactErrors.name && (
                <p className="text-sm text-red-600">{contactErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                {...registerContact('relationship')}
                placeholder="e.g., Mother, Best Friend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                {...registerContact('phone')}
                placeholder="+234 xxx xxx xxxx"
              />
              {contactErrors.phone && (
                <p className="text-sm text-red-600">{contactErrors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...registerContact('email')}
                placeholder="email@example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="canBeContacted"
                checked={canBeContacted}
                onChange={(e) => setContactValue('canBeContacted', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="canBeContacted" className="text-sm cursor-pointer">
                This person has consented to be contacted in emergencies
              </label>
            </div>
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddContactDialogOpen(false);
                resetContact();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitContact(onSubmitContact)}
              disabled={isAddingContact}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isAddingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
