'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Save,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface OrganizationGeneral {
  id: number;
  name: string;
  industry: string;
  size: string;
  address: string;
  phone: string;
  website: string;
  email: string;
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

export default function OrganizationGeneralPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<OrganizationGeneral>({
    id: 0,
    name: '',
    industry: '',
    size: '',
    address: '',
    phone: '',
    website: '',
    email: '',
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        setOrganization({
          id: data.id,
          name: data.name || '',
          industry: data.industry || '',
          size: data.size || '',
          address: data.address || '',
          phone: data.phone || '',
          website: data.website || '',
          email: '', // Not stored in organization table
        });
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization information',
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
        body: JSON.stringify(organization)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization information updated successfully'
        });
      } else {
        throw new Error('Failed to update organization');
      }
    } catch (error) {
      console.error('Failed to save organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to save organization information',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof OrganizationGeneral, value: string) => {
    setOrganization(prev => ({
      ...prev,
      [field]: value
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
            <h1 className="text-3xl font-bold tracking-tight">General Information</h1>
            <p className="text-muted-foreground mt-1">
              Basic organization profile and contact information
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

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
                value={organization.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={organization.industry}
                onValueChange={(value) => updateField('industry', value)}
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
                value={organization.size}
                onValueChange={(value) => updateField('size', value)}
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
                value={organization.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contact@example.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Organization email is managed through team settings
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={organization.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </Label>
              <Input
                id="website"
                value={organization.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </Label>
              <Textarea
                id="address"
                value={organization.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main St, Suite 100&#10;City, State 12345"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}