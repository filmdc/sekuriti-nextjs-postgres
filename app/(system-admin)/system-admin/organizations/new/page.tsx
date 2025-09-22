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
  const [currentTab, setCurrentTab] = useState('organization');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['organization']));
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Organization tab validation
    if (!orgName.trim()) {
      newErrors.orgName = 'Organization name is required';
      newErrors.organization = 'Required fields missing';
    }

    // Owner tab validation
    if (!ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
      newErrors.owner = 'Required fields missing';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
      newErrors.owner = 'Invalid email format';
    }

    if (!generatePassword && !ownerPassword.trim()) {
      newErrors.ownerPassword = 'Password is required when not auto-generating';
      newErrors.owner = 'Password required';
    } else if (!generatePassword && ownerPassword.length < 8) {
      newErrors.ownerPassword = 'Password must be at least 8 characters';
      newErrors.owner = 'Password too short';
    }

    // License tab validation
    if (!licenseCount || parseInt(licenseCount) < 1) {
      newErrors.licenseCount = 'At least 1 license is required';
      newErrors.license = 'Invalid license count';
    }

    if (enableTrial && (!trialDays || parseInt(trialDays) < 1)) {
      newErrors.trialDays = 'Trial days must be at least 1';
      newErrors.license = 'Invalid trial period';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setVisitedTabs(prev => new Set(prev).add(value));
  };

  const getTabStatus = (tab: string) => {
    if (!visitedTabs.has(tab)) return '';

    switch (tab) {
      case 'organization':
        return errors.organization ? 'error' : orgName ? 'complete' : 'incomplete';
      case 'owner':
        return errors.owner ? 'error' : ownerEmail ? 'complete' : 'incomplete';
      case 'license':
        return errors.license ? 'error' : 'complete';
      case 'provisioning':
        return 'complete'; // No required fields
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all tabs as visited to show validation errors
    setVisitedTabs(new Set(['organization', 'owner', 'license', 'provisioning']));

    if (!validateForm()) {
      // Find the first tab with errors
      const tabsWithErrors = [];
      if (errors.organization || !orgName) tabsWithErrors.push('organization');
      if (errors.owner || !ownerEmail) tabsWithErrors.push('owner');
      if (errors.license) tabsWithErrors.push('license');

      if (tabsWithErrors.length > 0) {
        setCurrentTab(tabsWithErrors[0]);
        toast({
          title: 'Validation Error',
          description: `Please complete all required fields. Check the ${tabsWithErrors.join(', ')} tab(s).`,
          variant: 'destructive',
        });
      }
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

      {/* Form Status Summary */}
      {visitedTabs.size > 1 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Form Completion Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getTabStatus('organization') === 'complete' ? 'bg-green-500' : getTabStatus('organization') === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span>Organization: {getTabStatus('organization') === 'complete' ? '✓' : getTabStatus('organization') === 'error' ? '✗' : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getTabStatus('owner') === 'complete' ? 'bg-green-500' : getTabStatus('owner') === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span>Owner: {getTabStatus('owner') === 'complete' ? '✓' : getTabStatus('owner') === 'error' ? '✗' : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getTabStatus('license') === 'complete' ? 'bg-green-500' : getTabStatus('license') === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <span>License: {getTabStatus('license') === 'complete' ? '✓' : getTabStatus('license') === 'error' ? '✗' : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getTabStatus('provisioning') === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span>Provisioning: ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="organization" className="relative">
              Organization
              {getTabStatus('organization') === 'error' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
              {getTabStatus('organization') === 'complete' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="owner" className="relative">
              Owner
              {getTabStatus('owner') === 'error' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
              {getTabStatus('owner') === 'complete' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="license" className="relative">
              License
              {getTabStatus('license') === 'error' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
              )}
              {getTabStatus('license') === 'complete' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="provisioning" className="relative">
              Provisioning
              {getTabStatus('provisioning') === 'complete' && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
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
                {/* Progress Indicator */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Required Information</p>
                      <p>Fields marked with * are required. You must complete all required fields before creating the organization.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="flex items-center">
                      Organization Name *
                      {errors.orgName && (
                        <span className="ml-2 text-xs text-red-500">({errors.orgName})</span>
                      )}
                    </Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        if (errors.orgName) {
                          const newErrors = { ...errors };
                          delete newErrors.orgName;
                          delete newErrors.organization;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="Acme Corporation"
                      className={errors.orgName ? 'border-red-500' : ''}
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
                {/* Progress Indicator */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20 p-4 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Organization Owner Setup</p>
                      <p>The owner email is required. A temporary password will be generated if not specified.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail" className="flex items-center">
                      Owner Email *
                      {errors.ownerEmail && (
                        <span className="ml-2 text-xs text-red-500">({errors.ownerEmail})</span>
                      )}
                    </Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => {
                        setOwnerEmail(e.target.value);
                        if (errors.ownerEmail) {
                          const newErrors = { ...errors };
                          delete newErrors.ownerEmail;
                          delete newErrors.owner;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="admin@example.com"
                      className={errors.ownerEmail ? 'border-red-500' : ''}
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
                      <Label htmlFor="ownerPassword" className="flex items-center">
                        Initial Password *
                        {errors.ownerPassword && (
                          <span className="ml-2 text-xs text-red-500">({errors.ownerPassword})</span>
                        )}
                      </Label>
                      <Input
                        id="ownerPassword"
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => {
                          setOwnerPassword(e.target.value);
                          if (errors.ownerPassword) {
                            const newErrors = { ...errors };
                            delete newErrors.ownerPassword;
                            delete newErrors.owner;
                            setErrors(newErrors);
                          }
                        }}
                        placeholder="Enter a secure password (min 8 characters)"
                        className={errors.ownerPassword ? 'border-red-500' : ''}
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