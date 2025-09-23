import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Database,
  Server,
  AlertCircle,
  Check,
  Clock,
} from 'lucide-react';

export default async function SystemSettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        </div>
        <p className="text-gray-600">
          Configure global system settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-name">Application Name</Label>
                <Input
                  id="app-name"
                  defaultValue="Sekuriti.io"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="app-url">Application URL</Label>
                <Input
                  id="app-url"
                  defaultValue="https://sekuriti.io"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue="support@sekuriti.io"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable to prevent user access during maintenance
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="registration">User Registration</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow new users to sign up
                  </p>
                </div>
                <Switch id="registration" defaultChecked />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  defaultValue="smtp.resend.com"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    defaultValue="587"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-encryption">Encryption</Label>
                  <select
                    id="smtp-encryption"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>TLS</option>
                    <option>SSL</option>
                    <option>None</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  defaultValue="resend"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  defaultValue="noreply@sekuriti.io"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline">Test Connection</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Connection Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Database Type:</span>
                    <span className="font-mono">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-mono">15.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-mono">2.4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Connections:</span>
                    <span className="font-mono">12 / 100</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="pool-size">Connection Pool Size</Label>
                <Input
                  id="pool-size"
                  type="number"
                  defaultValue="20"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  defaultValue="30"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Automatic Backups</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Daily backups at 2:00 AM UTC
                  </p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Run Backup Now</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5" />
              Maintenance Settings
            </h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      Scheduled Maintenance
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Next maintenance window: Sunday, 2:00 AM - 4:00 AM UTC
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <textarea
                  id="maintenance-message"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  defaultValue="The system is currently under maintenance. We'll be back shortly."
                />
              </div>
              <div>
                <Label htmlFor="log-retention">Log Retention (days)</Label>
                <Input
                  id="log-retention"
                  type="number"
                  defaultValue="90"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="60"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable detailed error logging
                  </p>
                </div>
                <Switch id="debug-mode" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Clear Logs</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Changes */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Configuration Changes
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Email settings updated</p>
              <p className="text-sm text-gray-600">Changed SMTP host configuration</p>
            </div>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Database backup enabled</p>
              <p className="text-sm text-gray-600">Automatic daily backups activated</p>
            </div>
            <p className="text-sm text-gray-500">1 day ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Session timeout increased</p>
              <p className="text-sm text-gray-600">Changed from 30 to 60 minutes</p>
            </div>
            <p className="text-sm text-gray-500">3 days ago</p>
          </div>
        </div>
      </Card>
    </div>
  );
}