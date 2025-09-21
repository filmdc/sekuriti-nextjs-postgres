import { getUser } from '@/lib/db/queries';
import { getAssetGroupsFlat } from '@/lib/db/queries-groups';
import { getTagsByOrganization } from '@/lib/db/queries-tags';
import { createAssetAction } from '@/lib/actions/assets';
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
import { TagSelector } from '@/components/assets/tag-selector';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default async function NewAssetPage() {
  const user = await getUser();
  if (!user?.teamId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to create assets</p>
      </div>
    );
  }

  const [groups, tags] = await Promise.all([
    getAssetGroupsFlat(user.teamId),
    getTagsByOrganization(user.teamId)
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Asset</h2>
          <p className="text-muted-foreground">
            Add a new asset to your inventory
          </p>
        </div>
      </div>

      <form action={createAssetAction}>
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
                  placeholder="e.g., Production Server 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" required>
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
                  name="identifier"
                  placeholder="e.g., SN-123456 or License Key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticality">Criticality</Label>
                <Select name="criticality">
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
                  name="description"
                  placeholder="Provide a detailed description of the asset..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Data Center A, Rack 12"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox id="mustContact" name="mustContact" value="true" />
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
                Who should be contacted about this asset?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContact">Name</Label>
                <Input
                  id="primaryContact"
                  name="primaryContact"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Email</Label>
                <Input
                  id="primaryContactEmail"
                  name="primaryContactEmail"
                  type="email"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Phone</Label>
                <Input
                  id="primaryContactPhone"
                  name="primaryContactPhone"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Secondary Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Secondary Contact</CardTitle>
              <CardDescription>
                Backup contact if primary is unavailable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secondaryContact">Name</Label>
                <Input
                  id="secondaryContact"
                  name="secondaryContact"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryContactEmail">Email</Label>
                <Input
                  id="secondaryContactEmail"
                  name="secondaryContactEmail"
                  type="email"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryContactPhone">Phone</Label>
                <Input
                  id="secondaryContactPhone"
                  name="secondaryContactPhone"
                  placeholder="+1 234 567 8901"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vendor & Contract Details</CardTitle>
              <CardDescription>
                Information about the vendor and contract
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name</Label>
                <Input
                  id="vendor"
                  name="vendor"
                  placeholder="e.g., Microsoft, AWS, Dell"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value/Cost</Label>
                <Input
                  id="value"
                  name="value"
                  placeholder="e.g., $10,000/year"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry/Renewal Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Categorize and organize your asset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">Asset Group</Label>
                <Select name="groupId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <input type="hidden" name="tags" id="tags-input" />
                {/* This would need client-side component for tag selection */}
                <p className="text-sm text-muted-foreground">
                  Tags can be added after creating the asset
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/assets">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Asset
          </Button>
        </div>
      </form>
    </div>
  );
}