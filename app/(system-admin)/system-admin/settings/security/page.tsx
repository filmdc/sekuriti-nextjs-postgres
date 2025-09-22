'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Fingerprint,
  Globe,
  UserX,
  Clock,
  BarChart,
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [securityScore] = useState(85);

  const handleSave = () => {
    toast({
      title: 'Security settings updated',
      description: 'Your security configuration has been saved successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-muted-foreground">
          Configure platform security policies and protections
        </p>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{securityScore}/100</span>
              <Badge variant={securityScore >= 80 ? 'default' : 'destructive'}>
                {securityScore >= 80 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={securityScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Your platform security score is based on enabled security features and best practices.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Two-Factor Authentication
              </span>
              <span className="text-muted-foreground">Enabled</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Password Complexity
              </span>
              <span className="text-muted-foreground">Strong</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Session Management
              </span>
              <span className="text-muted-foreground">Moderate</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Rate Limiting
              </span>
              <span className="text-muted-foreground">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="authentication" className="space-y-4">
        <TabsList>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="passwords">Passwords</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="threats">Threat Protection</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure authentication methods and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SSO/SAML</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable single sign-on
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>OAuth Providers</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow OAuth authentication
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Control session timeouts and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label>Idle Timeout (minutes)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Sessions per User</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label>Remember Me Duration (days)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="concurrent" defaultChecked />
                  <Label htmlFor="concurrent">Allow concurrent sessions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="persistent" />
                  <Label htmlFor="persistent">Enable persistent sessions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="invalidate" defaultChecked />
                  <Label htmlFor="invalidate">Invalidate sessions on password change</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Set password requirements and rotation policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
                <div className="space-y-2">
                  <Label>Password History</Label>
                  <Input type="number" defaultValue="5" placeholder="Remember last N passwords" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Login Attempts</Label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password Requirements</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="uppercase" defaultChecked />
                    <Label htmlFor="uppercase">Require uppercase letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="lowercase" defaultChecked />
                    <Label htmlFor="lowercase">Require lowercase letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="numbers" defaultChecked />
                    <Label htmlFor="numbers">Require numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="special" defaultChecked />
                    <Label htmlFor="special">Require special characters</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Configure IP restrictions and access policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>IP Allowlist</Label>
                  <textarea
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={4}
                    placeholder="Enter IP addresses or ranges (one per line)"
                    defaultValue="192.168.1.0/24\n10.0.0.0/8"
                  />
                </div>
                <div>
                  <Label>IP Blocklist</Label>
                  <textarea
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={4}
                    placeholder="Enter IP addresses or ranges to block (one per line)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="geo-blocking" />
                  <Label htmlFor="geo-blocking">Enable geographic restrictions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="vpn-detection" defaultChecked />
                  <Label htmlFor="vpn-detection">Detect and block VPN access</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Protection</CardTitle>
              <CardDescription>
                Configure security measures against attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit requests per IP address
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>DDoS Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable DDoS mitigation
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Brute Force Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent password guessing attacks
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SQL Injection Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable SQL injection prevention
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>XSS Protection</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent cross-site scripting
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Recent Security Events</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 3 failed login attempts from IP 192.168.1.100</li>
                <li>• Rate limit triggered for API key sk_test_987...</li>
                <li>• Suspicious activity detected from new device</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}