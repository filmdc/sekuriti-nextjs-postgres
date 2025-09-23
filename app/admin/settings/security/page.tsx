import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  UserCheck,
  Globe,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

export default async function SecuritySettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        </div>
        <p className="text-gray-600">
          Configure security policies and access controls
        </p>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Security Score</p>
              <p className="text-2xl font-bold mt-1">92/100</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Excellent security posture</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold mt-1">147</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Current active user sessions</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Logins (24h)</p>
              <p className="text-2xl font-bold mt-1">23</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Monitor for anomalies</p>
        </Card>
      </div>

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="password">Password Policy</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="ip">IP Restrictions</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="2fa-required">Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    All users must enable 2FA to access the system
                  </p>
                </div>
                <Switch id="2fa-required" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sso">Single Sign-On (SSO)</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow authentication via SAML 2.0 providers
                  </p>
                </div>
                <Switch id="sso" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="remember-me">Allow "Remember Me"</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Users can stay logged in for up to 30 days
                  </p>
                </div>
                <Switch id="remember-me" defaultChecked />
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="60"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div>
                <Label htmlFor="max-sessions">Maximum Concurrent Sessions</Label>
                <Input
                  id="max-sessions"
                  type="number"
                  defaultValue="3"
                  className="mt-1 max-w-xs"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="min-length">Minimum Password Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  defaultValue="12"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="uppercase">Require Uppercase Letters</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    At least one uppercase letter (A-Z)
                  </p>
                </div>
                <Switch id="uppercase" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowercase">Require Lowercase Letters</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    At least one lowercase letter (a-z)
                  </p>
                </div>
                <Switch id="lowercase" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="numbers">Require Numbers</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    At least one number (0-9)
                  </p>
                </div>
                <Switch id="numbers" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="special">Require Special Characters</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    At least one special character (!@#$%^&*)
                  </p>
                </div>
                <Switch id="special" defaultChecked />
              </div>
              <div>
                <Label htmlFor="expiry">Password Expiry (days)</Label>
                <Input
                  id="expiry"
                  type="number"
                  defaultValue="90"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div>
                <Label htmlFor="history">Password History</Label>
                <Input
                  id="history"
                  type="number"
                  defaultValue="5"
                  className="mt-1 max-w-xs"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Prevent reuse of last N passwords
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Access Control Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-lock">Auto-lock Inactive Accounts</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Lock accounts after 90 days of inactivity
                  </p>
                </div>
                <Switch id="auto-lock" defaultChecked />
              </div>
              <div>
                <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  defaultValue="5"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div>
                <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                <Input
                  id="lockout-duration"
                  type="number"
                  defaultValue="30"
                  className="mt-1 max-w-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="admin-approval">Require Admin Approval</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    New users need admin approval to access
                  </p>
                </div>
                <Switch id="admin-approval" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-verify">Email Verification Required</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Users must verify email before first login
                  </p>
                </div>
                <Switch id="email-verify" defaultChecked />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ip" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              IP Restrictions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-whitelist">Enable IP Whitelist</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Only allow access from specified IP addresses
                  </p>
                </div>
                <Switch id="ip-whitelist" />
              </div>
              <div>
                <Label>Allowed IP Addresses</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="192.168.1.0/24" />
                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">10.0.0.0/8</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">172.16.0.0/12</span>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="geo-blocking">Geographic Restrictions</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Block access from specific countries
                  </p>
                </div>
                <Switch id="geo-blocking" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vpn-detection">VPN/Proxy Detection</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Block access from known VPN and proxy services
                  </p>
                </div>
                <Switch id="vpn-detection" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </Card>

          {/* Blocked IPs */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Blocked IP Addresses
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <span className="text-sm font-mono">45.142.120.34</span>
                  <p className="text-sm text-gray-600">Suspicious activity detected</p>
                </div>
                <Button size="sm" variant="outline">
                  Unblock
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <span className="text-sm font-mono">192.241.210.88</span>
                  <p className="text-sm text-gray-600">Multiple failed login attempts</p>
                </div>
                <Button size="sm" variant="outline">
                  Unblock
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Audit Log */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Security Events
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">2FA enabled</p>
                <p className="text-sm text-gray-600">admin@sekuriti.io enabled two-factor authentication</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">10 minutes ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">Failed login attempt</p>
                <p className="text-sm text-gray-600">3 failed attempts from IP 192.168.1.100</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">1 hour ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Password policy updated</p>
                <p className="text-sm text-gray-600">Minimum length changed to 12 characters</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">2 days ago</p>
          </div>
        </div>
      </Card>
    </div>
  );
}