import { Suspense } from 'react';
import { getTeamForUser } from '@/lib/db/queries';
import { getAssets, getAssetStatistics } from '@/lib/db/queries-assets';
import { getAssetGroups } from '@/lib/db/queries-groups';
import { getTagsByOrganization } from '@/lib/db/queries-tags';
import { AssetListClient } from './asset-list-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, HardDrive, AlertTriangle, Tag, FolderTree, Upload, Download } from 'lucide-react';
import Link from 'next/link';

function AssetsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

async function AssetsDashboard({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const team = await getTeamForUser();
  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view assets</p>
      </div>
    );
  }

  // Parse filters from searchParams
  const filters = {
    type: searchParams.type as string | undefined,
    search: searchParams.search as string | undefined,
    criticality: searchParams.criticality as string | undefined,
    tags: searchParams.tags ? (searchParams.tags as string).split(',').map(Number) : undefined,
    groupId: searchParams.group ? parseInt(searchParams.group as string) : undefined,
    view: (searchParams.view as 'card' | 'table') || 'card',
    sortBy: searchParams.sortBy as string | undefined,
    sortOrder: searchParams.sortOrder as 'asc' | 'desc' | undefined
  };

  const [assets, groups, tags, stats] = await Promise.all([
    getAssets(team.id, filters),
    getAssetGroups(team.id),
    getTagsByOrganization(team.id),
    getAssetStatistics(team.id)
  ]);

  return (
    <AssetListClient
      assets={assets}
      groups={groups}
      tags={tags}
      stats={stats}
      initialFilters={filters}
    />
  );
}

export default async function AssetsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 md:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Asset Management</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Track and manage your organization's critical assets
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/assets/groups">
              <FolderTree className="h-4 w-4 mr-2" />
              <span className="sm:inline">Groups</span>
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/assets/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Add Asset</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<AssetsSkeleton />}>
        <AssetsDashboard searchParams={params} />
      </Suspense>
    </div>
  );
}