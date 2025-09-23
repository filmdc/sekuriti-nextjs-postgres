'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Save,
  AlertTriangle,
  Bell,
  Clock,
  Shield,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface OrganizationSettings {
  id: number;
  name: string;
  industry: string;
  size: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  timezone: string;
  notificationPreferences: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    incidentNotifications: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
  };
  securitySettings: {
    requireTwoFactor: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
  };
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Non-profit',
  'Professional Services',
  'Other'
];

const companySizes = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland'
];

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OrganizationSettings>({
    id: 0,
    name: '',
    industry: '',
    size: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    timezone: 'America/New_York',
    notificationPreferences: {
      emailAlerts: true,
      smsAlerts: false,
      incidentNotifications: true,
      dailyDigest: false,
      weeklyReport: true
    },
    securitySettings: {
      requireTwoFactor: false,
      sessionTimeout: 30,
      ipWhitelist: []
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/organization/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/organization/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization settings updated successfully'
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save organization settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNotificationPreferences = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: value
      }
    }));
  };

  const updateSecuritySettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      securitySettings: {
        ...prev.securitySettings,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization profile and preferences
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => updateSettings('name', e.target.value)}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={settings.industry}
                    onValueChange={(value) => updateSettings('industry', value)}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={settings.size}
                    onValueChange={(value) => updateSettings('size', value)}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSettings('timezone', value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How to reach your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Contact Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings('email', e.target.value)}
                    placeholder="contact@example.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Organization contact email is managed in team settings
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => updateSettings('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e) => updateSettings('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => updateSettings('address', e.target.value)}
                    placeholder="123 Main St, Suite 100&#10;City, State 12345"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how your organization receives notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences.emailAlerts}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences('emailAlerts', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get text messages for critical incidents
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences.smsAlerts}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences('smsAlerts', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Incident Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Real-time updates for incident activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences.incidentNotifications}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences('incidentNotifications', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of daily activities sent each morning
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences.dailyDigest}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences('dailyDigest', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive weekly summary every Monday
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences.weeklyReport}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences('weeklyReport', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      All users must enable 2FA to access the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings('requireTwoFactor', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="timeout">Session Timeout (minutes)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="timeout"
                      type="number"
                      min="5"
                      max="120"
                      value={settings.securitySettings.sessionTimeout}
                      onChange={(e) =>
                        updateSecuritySettings('sessionTimeout', parseInt(e.target.value))
                      }
                      className="max-w-[120px]"
                    />
                    <span className="text-sm text-muted-foreground">
                      Automatically log out inactive users
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Actions here can significantly impact your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Organization
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This action cannot be undone. Please contact support for assistance.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}