'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { QuotaErrorAlert } from '@/components/quota/quota-error-alert';
import { QuotaWarningBadge } from '@/components/quota/quota-warning-badge';
import { useOrganizationLimits, useQuotaError } from '@/lib/hooks/use-organization-limits';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface CreateAssetFormProps {
  groups: any[];
  tags: any[];
}

export function CreateAssetForm({ groups, tags }: CreateAssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<any>(null);
  const { limits } = useOrganizationLimits();
  const { isQuotaError, quotaError } = useQuotaError(apiError);

  // Check if we're approaching or at quota limit
  const assetQuotaReached = limits?.maxAssets &&
    (limits.currentUsers || 0) >= limits.maxAssets;
  const assetQuotaWarning = limits?.maxAssets &&
    (limits.currentUsers || 0) >= limits.maxAssets * 0.8;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    identifier: '',
    criticality: 'medium',
    description: '',
    location: '',
    mustContact: false,
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    primaryContactRole: '',
    groupId: '',
    selectedTags: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for quota or feature errors
        if (data.code === 'QUOTA_EXCEEDED' || data.code === 'FEATURE_RESTRICTED') {
          setApiError(data);
          return;
        }
        throw new Error(data.message || 'Failed to create asset');
      }

      toast.success('Asset created successfully');
      router.push(`/assets/${data.id}`);
    } catch (error) {
      console.error('Error creating asset:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create asset. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Quota Error Alert */}
      {quotaError && (
        <QuotaErrorAlert
          error={quotaError}
          onDismiss={() => setApiError(null)}
          className="mb-4"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the asset
                </CardDescription>
              </div>
              {limits?.maxAssets && (
                <QuotaWarningBadge
                  current={limits.currentUsers || 0}
                  limit={limits.maxAssets}
                  resource="assets"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production Server 1"
                required
                disabled={assetQuotaReached}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={assetQuotaReached}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="e.g., SN-123456 or License Key"
                disabled={assetQuotaReached}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticality">Criticality</Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) => setFormData({ ...formData, criticality: value })}
                disabled={assetQuotaReached}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select criticality level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the asset..."
                rows={4}
                disabled={assetQuotaReached}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Data Center A, Rack 12"
                disabled={assetQuotaReached}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="mustContact"
                checked={formData.mustContact}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, mustContact: checked as boolean })
                }
                disabled={assetQuotaReached}
              />
              <Label htmlFor="mustContact" className="font-normal">
                Must contact during incidents
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Contact</CardTitle>
            <CardDescription>
              Who to contact regarding this asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryContactName">Name</Label>
              <Input
                id="primaryContactName"
                value={formData.primaryContactName}
                onChange={(e) =>
                  setFormData({ ...formData, primaryContactName: e.target.value })
                }
                placeholder="John Doe"
                disabled={assetQuotaReached}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactEmail">Email</Label>
              <Input
                id="primaryContactEmail"
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, primaryContactEmail: e.target.value })
                }
                placeholder="john@example.com"
                disabled={assetQuotaReached}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactPhone">Phone</Label>
              <Input
                id="primaryContactPhone"
                value={formData.primaryContactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, primaryContactPhone: e.target.value })
                }
                placeholder="+1 555 0123"
                disabled={assetQuotaReached}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactRole">Role</Label>
              <Input
                id="primaryContactRole"
                value={formData.primaryContactRole}
                onChange={(e) =>
                  setFormData({ ...formData, primaryContactRole: e.target.value })
                }
                placeholder="System Administrator"
                disabled={assetQuotaReached}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Categorize and group this asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">Asset Group</Label>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
                disabled={assetQuotaReached}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center space-x-1 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.selectedTags.includes(tag.id.toString())}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            selectedTags: [...formData.selectedTags, tag.id.toString()],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selectedTags: formData.selectedTags.filter(
                              (id) => id !== tag.id.toString()
                            ),
                          });
                        }
                      }}
                      disabled={assetQuotaReached}
                    />
                    <span
                      className="px-2 py-1 rounded-md text-xs"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 md:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || assetQuotaReached}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : assetQuotaReached ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Quota Exceeded
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Asset
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}