import { notFound } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { getAssetById } from '@/lib/db/queries-assets';
import { getTagsByOrganization } from '@/lib/db/queries-tags';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { TagManager } from '@/components/assets/tag-manager';
import {
  ArrowLeft,
  Edit,
  Trash,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Tag,
  Building,
  FileText,
  HardDrive,
  Code,
  Cloud,
  Database,
  Users,
  Briefcase,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { deleteAssetAction } from '@/lib/actions/assets';
import { AssetDetailClient } from './asset-detail-client';

const assetTypeIcons = {
  hardware: HardDrive,
  software: Code,
  service: Cloud,
  data: Database,
  personnel: Users,
  facility: Building,
  vendor: Briefcase,
  contract: FileText
};

const criticalityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

export default async function AssetDetailPage({
  params
}: {
  params: { id: string };
}) {
  const user = await getUser();
  if (!user?.teamId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view asset details</p>
      </div>
    );
  }

  const [assetData, availableTags] = await Promise.all([
    getAssetById(parseInt(params.id), user.teamId),
    getTagsByOrganization(user.teamId)
  ]);

  if (!assetData) {
    notFound();
  }

  const { asset, tags, groups } = assetData;
  const Icon = assetTypeIcons[asset.type] || HardDrive;
  const criticalityClass = asset.criticality ? criticalityColors[asset.criticality as keyof typeof criticalityColors] : '';

  const isExpiring = asset.expiryDate && new Date(asset.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = asset.expiryDate && new Date(asset.expiryDate) < new Date();

  const breadcrumbItems = [
    { label: 'Assets', href: '/assets', icon: Package },
    { label: asset.name }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-gray-500" />
              <h2 className="text-3xl font-bold tracking-tight">{asset.name}</h2>
            </div>
            {asset.identifier && (
              <p className="text-muted-foreground mt-1 font-mono">{asset.identifier}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/assets/${asset.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <form action={async () => {
            'use server';
            await deleteAssetAction(asset.id);
          }}>
            <Button type="submit" variant="outline" className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-sm">
          {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
        </Badge>
        {asset.criticality && (
          <Badge variant="outline" className={`text-sm ${criticalityClass}`}>
            {asset.criticality.charAt(0).toUpperCase() + asset.criticality.slice(1)} Criticality
          </Badge>
        )}
        {asset.mustContact && (
          <Badge variant="destructive" className="text-sm">
            Must Contact During Incidents
          </Badge>
        )}
        {isExpired && (
          <Badge variant="destructive" className="text-sm">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )}
        {isExpiring && !isExpired && (
          <Badge variant="outline" className="text-sm border-orange-500 text-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expires Soon
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{asset.description}</p>
              </div>
            )}

            {asset.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm">{asset.location}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(asset.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{new Date(asset.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.primaryContact ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Primary Contact</p>
                  <p className="font-medium">{asset.primaryContact}</p>
                  {asset.primaryContactEmail && (
                    <a
                      href={`mailto:${asset.primaryContactEmail}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                    >
                      <Mail className="h-3 w-3" />
                      {asset.primaryContactEmail}
                    </a>
                  )}
                  {asset.primaryContactPhone && (
                    <a
                      href={`tel:${asset.primaryContactPhone}`}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                    >
                      <Phone className="h-3 w-3" />
                      {asset.primaryContactPhone}
                    </a>
                  )}
                </div>

                {asset.secondaryContact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Secondary Contact</p>
                    <p className="font-medium">{asset.secondaryContact}</p>
                    {asset.secondaryContactEmail && (
                      <a
                        href={`mailto:${asset.secondaryContactEmail}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                      >
                        <Mail className="h-3 w-3" />
                        {asset.secondaryContactEmail}
                      </a>
                    )}
                    {asset.secondaryContactPhone && (
                      <a
                        href={`tel:${asset.secondaryContactPhone}`}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1"
                      >
                        <Phone className="h-3 w-3" />
                        {asset.secondaryContactPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contact information available</p>
            )}
          </CardContent>
        </Card>

        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor & Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asset.vendor && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                  <p className="text-sm">{asset.vendor}</p>
                </div>
              </div>
            )}

            {asset.value && (
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Value</p>
                  <p className="text-sm">{asset.value}</p>
                </div>
              </div>
            )}

            {asset.purchaseDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                  <p className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {asset.expiryDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                  <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                    {new Date(asset.expiryDate).toLocaleDateString()}
                    {isExpired && ' (Expired)'}
                    {isExpiring && !isExpired && ' (Expires soon)'}
                  </p>
                </div>
              </div>
            )}

            {!asset.vendor && !asset.value && !asset.purchaseDate && !asset.expiryDate && (
              <p className="text-sm text-muted-foreground">No vendor information available</p>
            )}
          </CardContent>
        </Card>

        {/* Tags Management */}
        <Card>
          <CardHeader>
            <CardTitle>Tags & Organization</CardTitle>
            <CardDescription>
              Manage tags and group memberships for this asset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetDetailClient
              asset={asset}
              initialTags={tags || []}
              availableTags={availableTags}
              groups={groups || []}
            />
          </CardContent>
        </Card>

        {/* Additional Metadata */}
        {asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(asset.metadata as Record<string, any>).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-muted-foreground">
                      {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm">{String(value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}