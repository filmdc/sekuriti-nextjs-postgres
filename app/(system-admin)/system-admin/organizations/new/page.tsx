'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  User,
  Mail,
  Key,
  Globe,
  Factory,
  Users,
  Calendar,
  Shield,
  Package,
  ChevronLeft,
  Save,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function CreateOrganizationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Organization details
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('small');
  const [website, setWebsite] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  // Owner details
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [generatePassword, setGeneratePassword] = useState(true);

  // License details
  const [licenseType, setLicenseType] = useState('standard');
  const [licenseCount, setLicenseCount] = useState('5');
  const [status, setStatus] = useState('active');
  const [trialDays, setTrialDays] = useState('14');
  const [enableTrial, setEnableTrial] = useState(false);

  // Features
  const [customDomainEnabled, setCustomDomainEnabled] = useState(false);
  const [whitelabelingEnabled, setWhitelabelingEnabled] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [apiAccessEnabled, setApiAccessEnabled] = useState(true);

  // Provisioning
  const [provisionTemplates, setProvisionTemplates] = useState(true);
  const [provisionDropdowns, setProvisionDropdowns] = useState(true);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName || !ownerEmail) {
      toast({
        title: 'Validation Error',
        description: 'Organization name and owner email are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/system-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          ownerEmail,
          ownerName,
          ownerPassword: generatePassword ? undefined : ownerPassword,
          industry,
          size,
          website,
          customDomain: customDomainEnabled ? customDomain : undefined,
          licenseType,
          licenseCount: parseInt(licenseCount),
          status: enableTrial ? 'trial' : status,
          trialDays: enableTrial ? parseInt(trialDays) : undefined,
          features: {
            customDomains: customDomainEnabled,
            whitelabeling: whitelabelingEnabled,
            sso: ssoEnabled,
            apiAccess: apiAccessEnabled,
          },
          provisioning: {
            templates: provisionTemplates,
            dropdowns: provisionDropdowns,
            sendWelcome: sendWelcomeEmail,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Organization "${orgName}" created successfully`,
        });
        router.push('/system-admin/organizations');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const licenseFeatures = {
    standard: {
      users: 5,
      incidents: 100,
      assets: 500,
      runbooks: 50,
      customDomain: false,
      whitelabeling: false,
      sso: false,
    },
    professional: {
      users: 25,
      incidents: 500,
      assets: 1000,
      runbooks: 100,
      customDomain: false,
      whitelabeling: false,
      sso: true,
    },
    enterprise: {
      users: 100,
      incidents: 1000,
      assets: 5000,
      runbooks: 500,
      customDomain: true,
      whitelabeling: true,
      sso: true,
    },
  };

  const currentFeatures = licenseFeatures[licenseType as keyof typeof licenseFeatures];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/system-admin/organizations">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Organization</h2>
          <p className="text-muted-foreground">
            Provision a new organization on the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="owner">Owner</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
          </TabsList>

          {/* Organization Details */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Basic information about the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Acme Corporation"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Organization Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-50)</SelectItem>
                        <SelectItem value="medium">Medium (51-200)</SelectItem>
                        <SelectItem value="large">Large (200+)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Custom Domain</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow organization to use a custom domain
                      </p>
                    </div>
                    <Switch
                      checked={customDomainEnabled}
                      onCheckedChange={setCustomDomainEnabled}
                      disabled={!currentFeatures.customDomain}
                    />
                  </div>
                  {customDomainEnabled && (
                    <Input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="app.example.com"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Owner Details */}
          <TabsContent value="owner">
            <Card>
              <CardHeader>
                <CardTitle>Organization Owner</CardTitle>
                <CardDescription>
                  Primary administrator for this organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Email *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Generate Temporary Password</Label>
                      <p className="text-sm text-muted-foreground">
                        System will generate a secure temporary password
                      </p>
                    </div>
                    <Switch
                      checked={generatePassword}
                      onCheckedChange={setGeneratePassword}
                    />
                  </div>
                  {!generatePassword && (
                    <div className="space-y-2">
                      <Label htmlFor="ownerPassword">Initial Password</Label>
                      <Input
                        id="ownerPassword"
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter a secure password"
                      />
                      <p className="text-xs text-muted-foreground">
                        User will be required to change password on first login
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Details */}
          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle>License Configuration</CardTitle>
                <CardDescription>
                  Set license type and limits for this organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">License Type</Label>
                    <Select value={licenseType} onValueChange={setLicenseType}>
                      <SelectTrigger id="licenseType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseCount">User Licenses</Label>
                    <Input
                      id="licenseCount"
                      type="number"
                      value={licenseCount}
                      onChange={(e) => setLicenseCount(e.target.value)}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                {/* License Features Display */}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-3">Included in {licenseType} plan:</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Max Incidents</span>
                      <span className="font-medium">{currentFeatures.incidents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Max Assets</span>
                      <span className="font-medium">{currentFeatures.assets}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Max Runbooks</span>
                      <span className="font-medium">{currentFeatures.runbooks}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Trial Period</Label>
                      <p className="text-sm text-muted-foreground">
                        Start with a trial period before activation
                      </p>
                    </div>
                    <Switch
                      checked={enableTrial}
                      onCheckedChange={setEnableTrial}
                    />
                  </div>
                  {enableTrial ? (
                    <div className="space-y-2">
                      <Label htmlFor="trialDays">Trial Duration (days)</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        value={trialDays}
                        onChange={(e) => setTrialDays(e.target.value)}
                        min="1"
                        max="90"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="status">Initial Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <h4 className="font-medium">Additional Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>White-labeling</Label>
                      <Switch
                        checked={whitelabelingEnabled}
                        onCheckedChange={setWhitelabelingEnabled}
                        disabled={!currentFeatures.whitelabeling}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Single Sign-On (SSO)</Label>
                      <Switch
                        checked={ssoEnabled}
                        onCheckedChange={setSsoEnabled}
                        disabled={!currentFeatures.sso}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>API Access</Label>
                      <Switch
                        checked={apiAccessEnabled}
                        onCheckedChange={setApiAccessEnabled}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provisioning Options */}
          <TabsContent value="provisioning">
            <Card>
              <CardHeader>
                <CardTitle>Provisioning Options</CardTitle>
                <CardDescription>
                  Configure initial setup for the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Provision System Templates</Label>
                      <p className="text-sm text-muted-foreground">
                        Include default runbooks and communication templates
                      </p>
                    </div>
                    <Switch
                      checked={provisionTemplates}
                      onCheckedChange={setProvisionTemplates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Provision Dropdown Options</Label>
                      <p className="text-sm text-muted-foreground">
                        Include default dropdown values for incidents, assets, etc.
                      </p>
                    </div>
                    <Switch
                      checked={provisionDropdowns}
                      onCheckedChange={setProvisionDropdowns}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send onboarding instructions to organization owner
                      </p>
                    </div>
                    <Switch
                      checked={sendWelcomeEmail}
                      onCheckedChange={setSendWelcomeEmail}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Provisioning Note</p>
                      <p>
                        The organization will be immediately accessible after creation.
                        {sendWelcomeEmail && ' The owner will receive login credentials via email.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/system-admin/organizations">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}