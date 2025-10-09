'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Settings,
  XCircle,
  Pause,
  Calendar,
  Award,
  Clock,
  DollarSign,
  FileText,
  Bell,
  Mail,
  Phone,
  Globe,
  Database,
  Shield,
  Users,
  BookOpen,
  Check,
  Save
} from 'lucide-react';

interface SystemSettings {
  cancellationRules: {
    minimumHours: number;
    penaltyFee: number;
    allowedCancellations: number;
    penaltyPolicy: string;
  };
  contractFreeze: {
    maxFreezeDays: number;
    minNoticeDays: number;
    freezeFee: number;
    maxFreezesPerYear: number;
  };
  classSettings: {
    maxStudentsPerClass: number;
    classDuration: number;
    bufferTime: number;
    rescheduleLimit: number;
  };
  certificates: {
    requirementPercentage: number;
    templatePath: string;
    autoGenerate: boolean;
    signatureRequired: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderHours: number;
    cancelNotification: boolean;
  };
  paymentSettings: {
    lateFeePercentage: number;
    gracePeriodDays: number;
    autoSuspend: boolean;
    refundPolicy: string;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('cancellation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<SystemSettings>({
    cancellationRules: {
      minimumHours: 6,
      penaltyFee: 25,
      allowedCancellations: 3,
      penaltyPolicy: 'After 3 free cancellations, a $25 fee applies for cancellations with less than 6 hours notice.'
    },
    contractFreeze: {
      maxFreezeDays: 30,
      minNoticeDays: 7,
      freezeFee: 50,
      maxFreezesPerYear: 2
    },
    classSettings: {
      maxStudentsPerClass: 8,
      classDuration: 60,
      bufferTime: 15,
      rescheduleLimit: 2
    },
    certificates: {
      requirementPercentage: 80,
      templatePath: '/certificates/template.pdf',
      autoGenerate: true,
      signatureRequired: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      reminderHours: 24,
      cancelNotification: true
    },
    paymentSettings: {
      lateFeePercentage: 5,
      gracePeriodDays: 7,
      autoSuspend: true,
      refundPolicy: 'Full refund within 7 days of purchase. 50% refund after 7 days but before first class.'
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      loadSettings();
    }
  }, [status, session, router]);

  const loadSettings = async () => {
    try {
      // TODO: Load settings from API
      console.log('Loading settings...');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Save settings to API
      console.log('Saving settings:', settings);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Settings & Rules
              </h1>
              <p className="text-gray-600">
                Configure cancellation policies, contracts, and system preferences
              </p>
            </div>
            <Button 
              onClick={saveSettings} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="cancellation" className="flex items-center gap-1 text-xs">
              <XCircle className="h-3 w-3" />
              Cancellation
            </TabsTrigger>
            <TabsTrigger value="freeze" className="flex items-center gap-1 text-xs">
              <Pause className="h-3 w-3" />
              Contract Freeze
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-1 text-xs">
              <Award className="h-3 w-3" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
              <Bell className="h-3 w-3" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1 text-xs">
              <DollarSign className="h-3 w-3" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Cancellation Rules */}
          <TabsContent value="cancellation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Cancellation Rules
                </CardTitle>
                <CardDescription>
                  Configure policies for class cancellations and penalties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Notice (Hours)</label>
                    <Input
                      type="number"
                      value={settings.cancellationRules.minimumHours}
                      onChange={(e) => updateSetting('cancellationRules', 'minimumHours', Number(e.target.value))}
                      placeholder="6"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum hours notice required for free cancellation</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Penalty Fee (USD)</label>
                    <Input
                      type="number"
                      value={settings.cancellationRules.penaltyFee}
                      onChange={(e) => updateSetting('cancellationRules', 'penaltyFee', Number(e.target.value))}
                      placeholder="25"
                    />
                    <p className="text-xs text-gray-500 mt-1">Fee charged for late cancellations</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Free Cancellations per Month</label>
                    <Input
                      type="number"
                      value={settings.cancellationRules.allowedCancellations}
                      onChange={(e) => updateSetting('cancellationRules', 'allowedCancellations', Number(e.target.value))}
                      placeholder="3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of free cancellations allowed per month</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                  <Textarea
                    value={settings.cancellationRules.penaltyPolicy}
                    onChange={(e) => updateSetting('cancellationRules', 'penaltyPolicy', e.target.value)}
                    rows={3}
                    placeholder="Detailed cancellation policy..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Freeze */}
          <TabsContent value="freeze">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pause className="h-5 w-5" />
                  Contract Freeze Rules
                </CardTitle>
                <CardDescription>
                  Configure policies for temporary contract suspension
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Freeze Days</label>
                    <Input
                      type="number"
                      value={settings.contractFreeze.maxFreezeDays}
                      onChange={(e) => updateSetting('contractFreeze', 'maxFreezeDays', Number(e.target.value))}
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum days a contract can be frozen</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Notice (Days)</label>
                    <Input
                      type="number"
                      value={settings.contractFreeze.minNoticeDays}
                      onChange={(e) => updateSetting('contractFreeze', 'minNoticeDays', Number(e.target.value))}
                      placeholder="7"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days of advance notice required</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Freeze Fee (USD)</label>
                    <Input
                      type="number"
                      value={settings.contractFreeze.freezeFee}
                      onChange={(e) => updateSetting('contractFreeze', 'freezeFee', Number(e.target.value))}
                      placeholder="50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Administrative fee for contract freeze</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Freezes per Year</label>
                    <Input
                      type="number"
                      value={settings.contractFreeze.maxFreezesPerYear}
                      onChange={(e) => updateSetting('contractFreeze', 'maxFreezesPerYear', Number(e.target.value))}
                      placeholder="2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum freezes allowed per contract year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Settings */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Class Configuration
                </CardTitle>
                <CardDescription>
                  Configure class capacity, duration, and scheduling rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Students per Class</label>
                    <Input
                      type="number"
                      value={settings.classSettings.maxStudentsPerClass}
                      onChange={(e) => updateSetting('classSettings', 'maxStudentsPerClass', Number(e.target.value))}
                      placeholder="8"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of students per group class</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class Duration (Minutes)</label>
                    <Input
                      type="number"
                      value={settings.classSettings.classDuration}
                      onChange={(e) => updateSetting('classSettings', 'classDuration', Number(e.target.value))}
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard duration for each class</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Buffer Time (Minutes)</label>
                    <Input
                      type="number"
                      value={settings.classSettings.bufferTime}
                      onChange={(e) => updateSetting('classSettings', 'bufferTime', Number(e.target.value))}
                      placeholder="15"
                    />
                    <p className="text-xs text-gray-500 mt-1">Break time between classes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reschedule Limit</label>
                    <Input
                      type="number"
                      value={settings.classSettings.rescheduleLimit}
                      onChange={(e) => updateSetting('classSettings', 'rescheduleLimit', Number(e.target.value))}
                      placeholder="2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max reschedules per class per student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Student Certificates
                </CardTitle>
                <CardDescription>
                  Configure certificate generation and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Completion Requirement (%)</label>
                    <Input
                      type="number"
                      value={settings.certificates.requirementPercentage}
                      onChange={(e) => updateSetting('certificates', 'requirementPercentage', Number(e.target.value))}
                      placeholder="80"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum attendance percentage for certificate</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Certificate Template</label>
                    <Input
                      value={settings.certificates.templatePath}
                      onChange={(e) => updateSetting('certificates', 'templatePath', e.target.value)}
                      placeholder="/certificates/template.pdf"
                    />
                    <p className="text-xs text-gray-500 mt-1">Path to certificate template file</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoGenerate"
                      checked={settings.certificates.autoGenerate}
                      onChange={(e) => updateSetting('certificates', 'autoGenerate', e.target.checked)}
                    />
                    <label htmlFor="autoGenerate" className="text-sm">
                      Auto-generate certificates upon course completion
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="signatureRequired"
                      checked={settings.certificates.signatureRequired}
                      onChange={(e) => updateSetting('certificates', 'signatureRequired', e.target.checked)}
                    />
                    <label htmlFor="signatureRequired" className="text-sm">
                      Require digital signature on certificates
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure email and SMS notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reminder Time (Hours)</label>
                    <Input
                      type="number"
                      value={settings.notifications.reminderHours}
                      onChange={(e) => updateSetting('notifications', 'reminderHours', Number(e.target.value))}
                      placeholder="24"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hours before class to send reminder</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emailEnabled"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                    />
                    <label htmlFor="emailEnabled" className="text-sm">
                      Enable email notifications
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="smsEnabled"
                      checked={settings.notifications.smsEnabled}
                      onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
                    />
                    <label htmlFor="smsEnabled" className="text-sm">
                      Enable SMS notifications
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cancelNotification"
                      checked={settings.notifications.cancelNotification}
                      onChange={(e) => updateSetting('notifications', 'cancelNotification', e.target.checked)}
                    />
                    <label htmlFor="cancelNotification" className="text-sm">
                      Send notifications for cancellations
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment & Billing Settings
                </CardTitle>
                <CardDescription>
                  Configure payment policies and billing rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Late Fee (%)</label>
                    <Input
                      type="number"
                      value={settings.paymentSettings.lateFeePercentage}
                      onChange={(e) => updateSetting('paymentSettings', 'lateFeePercentage', Number(e.target.value))}
                      placeholder="5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Late payment fee as percentage of amount due</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Grace Period (Days)</label>
                    <Input
                      type="number"
                      value={settings.paymentSettings.gracePeriodDays}
                      onChange={(e) => updateSetting('paymentSettings', 'gracePeriodDays', Number(e.target.value))}
                      placeholder="7"
                    />
                    <p className="text-xs text-gray-500 mt-1">Days after due date before late fee applies</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoSuspend"
                      checked={settings.paymentSettings.autoSuspend}
                      onChange={(e) => updateSetting('paymentSettings', 'autoSuspend', e.target.checked)}
                    />
                    <label htmlFor="autoSuspend" className="text-sm">
                      Auto-suspend accounts for non-payment
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Refund Policy</label>
                  <Textarea
                    value={settings.paymentSettings.refundPolicy}
                    onChange={(e) => updateSetting('paymentSettings', 'refundPolicy', e.target.value)}
                    rows={3}
                    placeholder="Refund policy details..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Additional Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <Database className="h-6 w-6 mb-2" />
                  <h4 className="font-medium">Database Backup</h4>
                  <p className="text-sm text-gray-500">Backup and restore data</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <Shield className="h-6 w-6 mb-2" />
                  <h4 className="font-medium">Security Settings</h4>
                  <p className="text-sm text-gray-500">Password policies, 2FA</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 text-left">
                <div>
                  <Globe className="h-6 w-6 mb-2" />
                  <h4 className="font-medium">Integration APIs</h4>
                  <p className="text-sm text-gray-500">Third-party connections</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}