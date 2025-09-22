'use client';

import { useState, useEffect, use } from 'react';
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
  Globe,
  Factory,
  Calendar,
  Shield,
  Package,
  ChevronLeft,
  Save,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orgId = resolvedParams.id;
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Organization details
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('small');
  const [website, setWebsite] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [allowedEmailDomains, setAllowedEmailDomains] = useState('');

  // License details
  const [licenseType, setLicenseType] = useState('standard');
  const [licenseCount, setLicenseCount] = useState('5');
  const [status, setStatus] = useState('active');
  const [expiresAt, setExpiresAt] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState('');

  // Features
  const [customDomainEnabled, setCustomDomainEnabled] = useState(false);
  const [whitelabelingEnabled, setWhitelabelingEnabled] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [apiAccessEnabled, setApiAccessEnabled] = useState(true);

  // Limits
  const [maxUsers, setMaxUsers] = useState('');
  const [maxIncidents, setMaxIncidents] = useState('');
  const [maxAssets, setMaxAssets] = useState('');
  const [maxRunbooks, setMaxRunbooks] = useState('');
  const [maxTemplates, setMaxTemplates] = useState('');
  const [maxStorageMb, setMaxStorageMb] = useState('');

  useEffect(() => {
    fetchOrganization();
  }, [orgId]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/system-admin/organizations/${orgId}`);
      if (response.ok) {
        const data = await response.json();
        const org = data.organization;
        const limits = data.limits || {};

        // Set organization details
        setOrgName(org.name || '');
        setIndustry(org.industry || '');
        setSize(org.size || 'small');
        setWebsite(org.website || '');
        setCustomDomain(org.customDomain || '');
        setPhone(org.phone || '');
        setAddress(org.address || '');
        setAllowedEmailDomains(org.allowedEmailDomains?.join(', ') || '');

        // Set license details
        setLicenseType(org.licenseType || 'standard');
        setLicenseCount(org.licenseCount?.toString() || '5');
        setStatus(org.status || 'active');
        setExpiresAt(org.expiresAt ? new Date(org.expiresAt).toISOString().split('T')[0] : '');
        setTrialEndsAt(org.trialEndsAt ? new Date(org.trialEndsAt).toISOString().split('T')[0] : '');

        // Set features
        const features = org.features ? (typeof org.features === 'string' ? JSON.parse(org.features) : org.features) : {};
        setCustomDomainEnabled(features.customDomains || false);
        setWhitelabelingEnabled(features.whitelabeling || false);
        setSsoEnabled(features.sso || false);
        setApiAccessEnabled(features.apiAccess !== false);

        // Set limits
        setMaxUsers(limits.maxUsers?.toString() || org.licenseCount?.toString() || '');
        setMaxIncidents(limits.maxIncidents?.toString() || '');
        setMaxAssets(limits.maxAssets?.toString() || '');
        setMaxRunbooks(limits.maxRunbooks?.toString() || '');
        setMaxTemplates(limits.maxTemplates?.toString() || '');
        setMaxStorageMb(limits.maxStorageMb?.toString() || '');
      } else {
        throw new Error('Failed to fetch organization');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/system-admin/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName) {
      toast({
        title: 'Validation Error',
        description: 'Organization name is required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/system-admin/organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          industry,
          size,
          website,
          phone,
          address,
          customDomain: customDomainEnabled ? customDomain : null,
          allowedEmailDomains: allowedEmailDomains ? allowedEmailDomains.split(',').map(d => d.trim()) : [],
          licenseType,
          licenseCount: parseInt(licenseCount),
          status,
          expiresAt: expiresAt || null,
          features: {
            customDomains: customDomainEnabled,
            whitelabeling: whitelabelingEnabled,
            sso: ssoEnabled,
            apiAccess: apiAccessEnabled,
          },
          limits: {
            maxUsers: maxUsers ? parseInt(maxUsers) : parseInt(licenseCount),
            maxIncidents: maxIncidents ? parseInt(maxIncidents) : null,
            maxAssets: maxAssets ? parseInt(maxAssets) : null,
            maxRunbooks: maxRunbooks ? parseInt(maxRunbooks) : null,
            maxTemplates: maxTemplates ? parseInt(maxTemplates) : null,
            maxStorageMb: maxStorageMb ? parseInt(maxStorageMb) : null,
            customDomainsAllowed: customDomainEnabled,
            whitelabelingAllowed: whitelabelingEnabled,
            ssoAllowed: ssoEnabled,
            apiAccessAllowed: apiAccessEnabled,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization updated successfully',
        });
        router.push(`/system-admin/organizations/${orgId}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const licenseFeatures = {
    standard: {
      incidents: 100,
      assets: 500,
      runbooks: 50,
      customDomain: false,
      whitelabeling: false,
      sso: false,
    },
    professional: {
      incidents: 500,
      assets: 1000,
      runbooks: 100,
      customDomain: false,
      whitelabeling: false,
      sso: true,
    },
    enterprise: {
      incidents: 1000,
      assets: 5000,
      runbooks: 500,
      customDomain: true,
      whitelabeling: true,
      sso: true,
    },
  };

  const currentFeatures = licenseFeatures[licenseType as keyof typeof licenseFeatures];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/system-admin/organizations/${orgId}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Organization</h2>
          <p className="text-muted-foreground">
            Update organization settings and configuration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="license">License & Features</TabsTrigger>
            <TabsTrigger value="limits">Resource Limits</TabsTrigger>
          </TabsList>

          {/* Organization Details */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Basic information and settings
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowedEmailDomains">Allowed Email Domains</Label>
                    <Input
                      id="allowedEmailDomains"
                      value={allowedEmailDomains}
                      onChange={(e) => setAllowedEmailDomains(e.target.value)}
                      placeholder="example.com, company.org"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of domains that can join this organization
                    </p>
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

          {/* License & Features */}
          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle>License & Features</CardTitle>
                <CardDescription>
                  Subscription and feature configuration
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>

                {status === 'trial' && (
                  <div className="space-y-2">
                    <Label htmlFor="trialEndsAt">Trial End Date</Label>
                    <Input
                      id="trialEndsAt"
                      type="date"
                      value={trialEndsAt}
                      onChange={(e) => setTrialEndsAt(e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                {/* Feature Toggles */}
                <div className="space-y-4">
                  <h4 className="font-medium">Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>White-labeling</Label>
                        <p className="text-sm text-muted-foreground">
                          Custom branding and theming
                        </p>
                      </div>
                      <Switch
                        checked={whitelabelingEnabled}
                        onCheckedChange={setWhitelabelingEnabled}
                        disabled={!currentFeatures.whitelabeling}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Single Sign-On (SSO)</Label>
                        <p className="text-sm text-muted-foreground">
                          SAML/OAuth integration
                        </p>
                      </div>
                      <Switch
                        checked={ssoEnabled}
                        onCheckedChange={setSsoEnabled}
                        disabled={!currentFeatures.sso}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>API Access</Label>
                        <p className="text-sm text-muted-foreground">
                          REST API and webhooks
                        </p>
                      </div>
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

          {/* Resource Limits */}
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>Resource Limits</CardTitle>
                <CardDescription>
                  Set maximum resource allocations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers">Max Users</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={maxUsers}
                      onChange={(e) => setMaxUsers(e.target.value)}
                      placeholder="Set maximum users"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxIncidents">Max Incidents</Label>
                    <Input
                      id="maxIncidents"
                      type="number"
                      value={maxIncidents}
                      onChange={(e) => setMaxIncidents(e.target.value)}
                      placeholder="Set maximum incidents"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxAssets">Max Assets</Label>
                    <Input
                      id="maxAssets"
                      type="number"
                      value={maxAssets}
                      onChange={(e) => setMaxAssets(e.target.value)}
                      placeholder="Set maximum assets"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRunbooks">Max Runbooks</Label>
                    <Input
                      id="maxRunbooks"
                      type="number"
                      value={maxRunbooks}
                      onChange={(e) => setMaxRunbooks(e.target.value)}
                      placeholder="Set maximum runbooks"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxTemplates">Max Templates</Label>
                    <Input
                      id="maxTemplates"
                      type="number"
                      value={maxTemplates}
                      onChange={(e) => setMaxTemplates(e.target.value)}
                      placeholder="Set maximum templates"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStorageMb">Max Storage (MB)</Label>
                    <Input
                      id="maxStorageMb"
                      type="number"
                      value={maxStorageMb}
                      onChange={(e) => setMaxStorageMb(e.target.value)}
                      placeholder="Set maximum storage"
                      min="100"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Limit Configuration</p>
                      <p>
                        These limits will be enforced at the application level.
                        Leave fields empty to use default values based on the license type.
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
          <Link href={`/system-admin/organizations/${orgId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}