'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DynamicSelect } from '@/components/ui/dynamic-select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TagSelector } from '@/components/assets/tag-selector';
import { toast } from 'sonner';

interface AssetFormProps {
  groups?: any[];
  tags?: any[];
  initialData?: any;
  mode?: 'create' | 'edit';
}

export function AssetForm({ groups = [], tags = [], initialData, mode = 'create' }: AssetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialData?.tags || []);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    identifier: initialData?.identifier || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    owner: initialData?.owner || '',
    criticality: initialData?.criticality || 'medium',
    status: initialData?.status || 'active',
    isMonitored: initialData?.isMonitored || false,
    groupId: initialData?.groupId || '',
    vendor: initialData?.vendor || '',
    version: initialData?.version || '',
    purchaseDate: initialData?.purchaseDate || '',
    warrantyExpiry: initialData?.warrantyExpiry || '',
    cost: initialData?.cost || '',
    ipAddress: initialData?.ipAddress || '',
    macAddress: initialData?.macAddress || '',
    operatingSystem: initialData?.operatingSystem || '',
    notes: initialData?.notes || '',
    customFields: initialData?.customFields || {},
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'create' ? '/api/assets' : `/api/assets/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} asset`);
      }

      const data = await response.json();
      toast.success(`Asset ${mode === 'create' ? 'created' : 'updated'} successfully`);

      if (mode === 'create') {
        router.push(`/assets/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(`Error ${mode}ing asset:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode} asset`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about the asset
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production Server 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <DynamicSelect
                dropdownKey="asset_type"
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                placeholder="Select asset type"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="e.g., SN-123456 or License Key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Person or team responsible"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the asset"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Classification & Status</CardTitle>
            <CardDescription>
              Risk level and operational status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="criticality">Criticality Level *</Label>
              <DynamicSelect
                dropdownKey="asset_criticality"
                value={formData.criticality}
                onValueChange={(value) => setFormData({ ...formData, criticality: value })}
                placeholder="Select criticality"
                showDescription
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <DynamicSelect
                dropdownKey="asset_status"
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                placeholder="Select status"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMonitored"
                checked={formData.isMonitored}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isMonitored: !!checked })
                }
              />
              <Label
                htmlFor="isMonitored"
                className="text-sm font-normal cursor-pointer"
              >
                Asset is actively monitored
              </Label>
            </div>

            {groups.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="groupId">Asset Group</Label>
                <select
                  id="groupId"
                  name="groupId"
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Network */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Network</CardTitle>
            <CardDescription>
              Physical and network information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Data Center A, Rack 42"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="e.g., 192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                name="macAddress"
                value={formData.macAddress}
                onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                placeholder="e.g., 00:1B:44:11:3A:B7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatingSystem">Operating System</Label>
              <Input
                id="operatingSystem"
                name="operatingSystem"
                value={formData.operatingSystem}
                onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                placeholder="e.g., Ubuntu 22.04 LTS"
              />
            </div>
          </CardContent>
        </Card>

        {/* Purchase & Warranty */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase & Warranty</CardTitle>
            <CardDescription>
              Vendor and financial information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g., Dell, Microsoft"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version/Model</Label>
              <Input
                id="version"
                name="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., R740, Version 2.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
              <Input
                id="warrantyExpiry"
                name="warrantyExpiry"
                type="date"
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Categorize with tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagSelector
                tags={tags}
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Any other relevant details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or comments"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Asset' : 'Update Asset'}
          </Button>
        </div>
      </div>
    </form>
  );
}