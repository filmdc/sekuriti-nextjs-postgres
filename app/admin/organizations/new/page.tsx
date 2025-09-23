'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Globe,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

const licenseTypes = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Basic features for small teams',
    limits: {
      users: 5,
      incidents: 100,
      assets: 500,
      runbooks: 50,
    },
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Advanced features for growing organizations',
    limits: {
      users: 25,
      incidents: 500,
      assets: 1000,
      runbooks: 100,
    },
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Full features with custom limits',
    limits: {
      users: 'Unlimited',
      incidents: 1000,
      assets: 5000,
      runbooks: 500,
    },
  },
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Education',
  'Government',
  'Non-Profit',
  'Other',
];

const organizationSizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export default function NewOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Organization Details
    name: '',
    industry: '',
    size: '',
    website: '',
    customDomain: '',

    // Owner Details
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',

    // License Configuration
    licenseType: 'standard',
    licenseCount: 5,
    status: 'active',
    trialDays: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/system-admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create organization');
      }

      const data = await response.json();
      setSuccess(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/organizations');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedLicense = licenseTypes.find(lt => lt.value === formData.licenseType);

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Organization Created Successfully
            </h2>
            <p className="text-gray-600 mb-4">
              The organization has been created and the owner has been notified.
            </p>
            <Link href="/admin/organizations">
              <Button>Back to Organizations</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/organizations">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Organization</h1>
        <p className="text-gray-600 mt-2">
          Set up a new organization with owner account and license configuration
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Information */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Building2 className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Organization Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Corporation"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
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

                  <div>
                    <Label htmlFor="size">Organization Size</Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => setFormData({ ...formData, size: value })}
                    >
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      placeholder="app.example.com"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Owner Account */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Organization Owner</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ownerEmail">Owner Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      placeholder="admin@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    If the user exists, they will be added as the owner. Otherwise, a new account will be created.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ownerPassword">Initial Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="ownerPassword"
                        type="password"
                        value={formData.ownerPassword}
                        onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                        placeholder="Leave blank for default"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* License Configuration */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">License Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select
                    value={formData.licenseType}
                    onValueChange={(value) => setFormData({ ...formData, licenseType: value })}
                  >
                    <SelectTrigger id="licenseType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-gray-500">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licenseCount">License Count</Label>
                    <Input
                      id="licenseCount"
                      type="number"
                      min="1"
                      value={formData.licenseCount}
                      onChange={(e) => setFormData({ ...formData, licenseCount: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.status === 'trial' && (
                  <div>
                    <Label htmlFor="trialDays">Trial Period (days)</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      min="0"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* License Details */}
            {selectedLicense && (
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">License Details</h3>
                <Badge className="mb-4">{selectedLicense.label}</Badge>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Max Users</p>
                    <p className="font-semibold">{selectedLicense.limits.users}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Incidents</p>
                    <p className="font-semibold">{selectedLicense.limits.incidents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Assets</p>
                    <p className="font-semibold">{selectedLicense.limits.assets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Runbooks</p>
                    <p className="font-semibold">{selectedLicense.limits.runbooks}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800">
                        The owner will receive an email with login credentials and instructions to set up their organization.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <Link href="/admin/organizations">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </div>
      </form>
    </div>
  );
}