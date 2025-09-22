'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Globe,
  Mail,
  Database,
  Shield,
  Bell,
  Palette,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your system settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input defaultValue="Sekuriti.io" />
                </div>
                <div className="space-y-2">
                  <Label>Platform URL</Label>
                  <Input defaultValue="https://sekuriti.io" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" defaultValue="support@sekuriti.io" />
                </div>
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Input defaultValue="UTC" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="maintenance" />
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="registration" defaultChecked />
                  <Label htmlFor="registration">Allow New Registrations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="2fa" defaultChecked />
                  <Label htmlFor="2fa">Require 2FA for System Admins</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email service settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input defaultValue="smtp.resend.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input type="number" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input defaultValue="resend" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input type="email" defaultValue="noreply@sekuriti.io" />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input defaultValue="Sekuriti.io" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>
                Database connection and optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Connection Pool Size</Label>
                  <Input type="number" defaultValue="20" />
                </div>
                <div className="space-y-2">
                  <Label>Query Timeout (ms)</Label>
                  <Input type="number" defaultValue="30000" />
                </div>
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Input defaultValue="Daily" />
                </div>
                <div className="space-y-2">
                  <Label>Retention Period (days)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sms-notifications" />
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="webhook-notifications" defaultChecked />
                  <Label htmlFor="webhook-notifications">Webhook Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="daily-digest" defaultChecked />
                  <Label htmlFor="daily-digest">Daily Admin Digest</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the platform appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input defaultValue="/logo.svg" />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input defaultValue="/favicon.ico" />
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input type="color" defaultValue="#0066CC" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <Input type="color" defaultValue="#FF6600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" defaultChecked />
                  <Label htmlFor="dark-mode">Enable Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="custom-branding" />
                  <Label htmlFor="custom-branding">Allow Custom Branding</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}