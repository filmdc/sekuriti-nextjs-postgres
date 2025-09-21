import { notFound } from 'next/navigation';
import { getTeamForUser } from '@/lib/db/queries';
import { getAssetById } from '@/lib/db/queries-assets';
import { getAssetGroupsFlat } from '@/lib/db/queries-groups';
import { getTagsByOrganization } from '@/lib/db/queries-tags';
import { updateAssetAction } from '@/lib/actions/assets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';

export default async function EditAssetPage({
  params
}: {
  params: { id: string };
}) {
  const team = await getTeamForUser();
  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to edit assets</p>
      </div>
    );
  }

  const [assetData, groups, tags] = await Promise.all([
    getAssetById(parseInt(params.id), team.id),
    getAssetGroupsFlat(team.id),
    getTagsByOrganization(team.id)
  ]);

  if (!assetData) {
    notFound();
  }

  const { asset } = assetData;

  // Format dates for input fields
  const purchaseDate = asset.purchaseDate
    ? new Date(asset.purchaseDate).toISOString().split('T')[0]
    : '';
  const expiryDate = asset.expiryDate
    ? new Date(asset.expiryDate).toISOString().split('T')[0]
    : '';

  const updateAssetWithId = updateAssetAction.bind(null, asset.id);

  const breadcrumbItems = [
    { label: 'Assets', href: '/assets', icon: Package },
    { label: asset.name, href: `/assets/${asset.id}` },
    { label: 'Edit' }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/assets/${asset.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Asset</h2>
          <p className="text-muted-foreground">
            Update {asset.name}
          </p>
        </div>
      </div>

      <form action={updateAssetWithId}>
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
                  defaultValue={asset.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" defaultValue={asset.type} required>
                  <SelectTrigger>
                    <SelectValue />
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
                  defaultValue={asset.identifier || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="criticality">Criticality</Label>
                <Select name="criticality" defaultValue={asset.criticality || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select criticality level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                  defaultValue={asset.description || ''}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={asset.location || ''}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="mustContact"
                  name="mustContact"
                  value="true"
                  defaultChecked={asset.mustContact}
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
                Who should be contacted about this asset?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContact">Name</Label>
                <Input
                  id="primaryContact"
                  name="primaryContact"
                  defaultValue={asset.primaryContact || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Email</Label>
                <Input
                  id="primaryContactEmail"
                  name="primaryContactEmail"
                  type="email"
                  defaultValue={asset.primaryContactEmail || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Phone</Label>
                <Input
                  id="primaryContactPhone"
                  name="primaryContactPhone"
                  defaultValue={asset.primaryContactPhone || ''}
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
                  defaultValue={asset.secondaryContact || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryContactEmail">Email</Label>
                <Input
                  id="secondaryContactEmail"
                  name="secondaryContactEmail"
                  type="email"
                  defaultValue={asset.secondaryContactEmail || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryContactPhone">Phone</Label>
                <Input
                  id="secondaryContactPhone"
                  name="secondaryContactPhone"
                  defaultValue={asset.secondaryContactPhone || ''}
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
                  defaultValue={asset.vendor || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value/Cost</Label>
                <Input
                  id="value"
                  name="value"
                  defaultValue={asset.value || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  defaultValue={purchaseDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry/Renewal Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  defaultValue={expiryDate}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href={`/assets/${asset.id}`}>Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}