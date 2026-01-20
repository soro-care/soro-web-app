// 📁 FILE: src/app/(admin)/settings/page.tsx
// ============================================

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Settings, Shield, Bell, Mail, Globe, Database, 
  Key, CreditCard, MessageSquare, CheckCircle,
  AlertTriangle, Save, RefreshCw, Eye, EyeOff,
  DollarSign
} from 'lucide-react';
import type { 
  GeneralSettings,
  SecuritySettings,
  NotificationSettings,
  BookingSettings,
  PaymentSettings,
  ModerationSettings,
  SaveStatus
} from '../types';

// Define tab type
type TabId = 'general' | 'security' | 'notifications' | 'bookings' | 'payments' | 'moderation' | 'api';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>; // More specific type
}

// Helper to safely access notification settings
type NotificationKey = keyof NotificationSettings;
type ModerationKey = keyof ModerationSettings;

// Notification labels mapping
const NOTIFICATION_LABELS: Record<NotificationKey, string> = {
  emailNotifications: 'Email Notifications',
  pushNotifications: 'Push Notifications',
  newUserAlert: 'New User Registration Alert',
  newBookingAlert: 'New Booking Alert',
  flaggedContentAlert: 'Flagged Content Alert',
  systemUpdates: 'System Update Notifications',
  weeklyReport: 'Weekly Analytics Report'
};

// Moderation labels mapping
const MODERATION_LABELS: Record<ModerationKey, { label: string; desc: string }> = {
  autoModeration: { label: 'Auto Moderation', desc: 'Automatically flag inappropriate content' },
  profanityFilter: { label: 'Profanity Filter', desc: 'Filter out profane language' },
  flagThreshold: { label: 'Flag Threshold', desc: 'Number of reports before content is flagged' },
  autoRemoveThreshold: { label: 'Auto-Remove Threshold', desc: 'Number of reports before auto-removal' },
  requireApproval: { label: 'Require Approval', desc: 'All content needs admin approval' },
  spamDetection: { label: 'Spam Detection', desc: 'Automatically detect spam content' }
};

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'SORO',
    siteDescription: 'Mental health support platform',
    contactEmail: 'support@soro.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    loginAttempts: 5,
    lockoutDuration: 15
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    newUserAlert: true,
    newBookingAlert: true,
    flaggedContentAlert: true,
    systemUpdates: true,
    weeklyReport: true
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    maxAdvanceBooking: 30,
    minAdvanceBooking: 24,
    sessionDurations: [30, 45, 60, 90],
    defaultDuration: 60,
    allowCancellation: true,
    cancellationWindow: 24,
    autoConfirm: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    currency: 'USD',
    commissionRate: 15,
    payoutSchedule: 'weekly',
    minimumPayout: 50,
    stripeEnabled: true,
    paypalEnabled: false
  });

  // Moderation Settings
  const [moderationSettings, setModerationSettings] = useState<ModerationSettings>({
    autoModeration: true,
    profanityFilter: true,
    flagThreshold: 3,
    autoRemoveThreshold: 10,
    requireApproval: false,
    spamDetection: true
  });

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  }, []);

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'bookings', label: 'Bookings', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'moderation', label: 'Moderation', icon: AlertTriangle },
    { id: 'api', label: 'API & Integrations', icon: Key }
  ];

  // Handle notification setting change
  const handleNotificationChange = useCallback((key: NotificationKey, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Handle moderation setting change
  const handleModerationChange = useCallback((key: ModerationKey, value: boolean | number) => {
    setModerationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your platform configuration
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 w-full md:w-auto"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">General Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure basic platform settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={generalSettings.siteDescription}
                        onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={generalSettings.timezone}
                          onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST</option>
                          <option value="PST">PST</option>
                          <option value="GMT">GMT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Put the site in maintenance mode
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generalSettings.maintenanceMode}
                          onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure authentication and security policies
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Require 2FA for all admin accounts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorRequired}
                          onChange={(e) => setSecuritySettings({...securitySettings, twoFactorRequired: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password Min Length
                        </label>
                        <input
                          type="number"
                          value={securitySettings.passwordMinLength}
                          onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value) || 8})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={securitySettings.loginAttempts}
                          onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value) || 5})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lockout Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={securitySettings.lockoutDuration}
                          onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value) || 15})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Require Special Characters</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Passwords must include special characters
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.passwordRequireSpecial}
                          onChange={(e) => setSecuritySettings({...securitySettings, passwordRequireSpecial: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notification Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Manage how you receive alerts
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(Object.entries(NOTIFICATION_LABELS) as [NotificationKey, string][]).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key]}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure booking policies and limits
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Advance Booking (days)
                        </label>
                        <input
                          type="number"
                          value={bookingSettings.maxAdvanceBooking}
                          onChange={(e) => setBookingSettings({...bookingSettings, maxAdvanceBooking: parseInt(e.target.value) || 30})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Min Advance Booking (hours)
                        </label>
                        <input
                          type="number"
                          value={bookingSettings.minAdvanceBooking}
                          onChange={(e) => setBookingSettings({...bookingSettings, minAdvanceBooking: parseInt(e.target.value) || 24})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default Duration (minutes)
                        </label>
                        <select
                          value={bookingSettings.defaultDuration}
                          onChange={(e) => setBookingSettings({...bookingSettings, defaultDuration: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          {bookingSettings.sessionDurations.map(duration => (
                            <option key={duration} value={duration}>{duration} minutes</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cancellation Window (hours)
                        </label>
                        <input
                          type="number"
                          value={bookingSettings.cancellationWindow}
                          onChange={(e) => setBookingSettings({...bookingSettings, cancellationWindow: parseInt(e.target.value) || 24})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Cancellation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Users can cancel their bookings
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bookingSettings.allowCancellation}
                            onChange={(e) => setBookingSettings({...bookingSettings, allowCancellation: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-Confirm Bookings</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically confirm new bookings
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bookingSettings.autoConfirm}
                            onChange={(e) => setBookingSettings({...bookingSettings, autoConfirm: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure payment processing and payouts
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Currency
                        </label>
                        <select
                          value={paymentSettings.currency}
                          onChange={(e) => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                          <option value="AUD">AUD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Commission Rate (%)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.commissionRate}
                          onChange={(e) => setPaymentSettings({...paymentSettings, commissionRate: parseInt(e.target.value) || 15})}
                          min="0"
                          max="50"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Payout Schedule
                        </label>
                        <select
                          value={paymentSettings.payoutSchedule}
                          onChange={(e) => setPaymentSettings({...paymentSettings, payoutSchedule: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Minimum Payout ($)
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.minimumPayout}
                          onChange={(e) => setPaymentSettings({...paymentSettings, minimumPayout: parseInt(e.target.value) || 50})}
                          min="0"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Stripe</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Process payments via Stripe</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.stripeEnabled}
                            onChange={(e) => setPaymentSettings({...paymentSettings, stripeEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">PayPal</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Process payments via PayPal</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.paypalEnabled}
                            onChange={(e) => setPaymentSettings({...paymentSettings, paypalEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation */}
              {activeTab === 'moderation' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Moderation Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure content moderation policies
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      {(Object.entries(MODERATION_LABELS) as [ModerationKey, { label: string; desc: string }][]).map(([key, { label, desc }]) => {
                        // Skip numeric fields for the checkbox section
                        if (key === 'flagThreshold' || key === 'autoRemoveThreshold') {
                          return null;
                        }
                        
                        return (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={moderationSettings[key] as boolean}
                                onChange={(e) => handleModerationChange(key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Flag Threshold
                        </label>
                        <input
                          type="number"
                          value={moderationSettings.flagThreshold}
                          onChange={(e) => handleModerationChange('flagThreshold', parseInt(e.target.value) || 3)}
                          min="1"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Number of reports before content is flagged
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Auto-Remove Threshold
                        </label>
                        <input
                          type="number"
                          value={moderationSettings.autoRemoveThreshold}
                          onChange={(e) => handleModerationChange('autoRemoveThreshold', parseInt(e.target.value) || 10)}
                          min="1"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Number of reports before auto-removal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API & Integrations */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">API & Integrations</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Manage API keys and third-party integrations
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/30">
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 dark:text-blue-300 mb-2">API Key</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg text-sm font-mono">
                                •••••••••••••••••••••••••••
                              </code>
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              {showApiKey ? 
                                <EyeOff className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : 
                                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              }
                            </button>
                          </div>
                          <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                            Keep this key secure. Do not share it publicly.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">User Registration</p>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          https://api.yourapp.com/webhooks/user-registration
                        </p>
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-600 hover:underline">Edit</button>
                          <button className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">Booking Completed</p>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          https://api.yourapp.com/webhooks/booking-completed
                        </p>
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-600 hover:underline">Edit</button>
                          <button className="text-sm text-red-600 hover:underline">Delete</button>
                        </div>
                      </div>

                      <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-gray-600 dark:text-gray-400 hover:text-red-600">
                        + Add New Webhook
                      </button>
                    </div>

                    <div className="space-y-3 mt-6">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Third-Party Integrations</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">SendGrid</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Connected
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email service provider</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">AWS S3</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Connected
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">File storage</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl opacity-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">Google Analytics</p>
                            </div>
                            <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                              Connect
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Analytics platform</p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl opacity-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">Slack</p>
                            </div>
                            <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                              Connect
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Team notifications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;