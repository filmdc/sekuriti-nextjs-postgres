import { getUser } from '@/lib/db/queries';
import { getAssetGroups, getGroupStatistics } from '@/lib/db/queries-groups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssetGroupTree } from '@/components/assets/asset-group-tree';
import {
  ArrowLeft,
  Plus,
  FolderTree,
  Folder,
  Users,
  Zap,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { AssetGroupsClient } from './groups-client';

export default async function AssetGroupsPage() {
  const user = await getUser();
  if (!user?.teamId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to manage asset groups</p>
      </div>
    );
  }

  const [groups, stats] = await Promise.all([
    getAssetGroups(user.teamId),
    getGroupStatistics(user.teamId)
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Asset Groups</h2>
            <p className="text-muted-foreground mt-1">
              Organize your assets into logical groups
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/assets/groups/new">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Organizational units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dynamic Groups</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dynamic}</div>
            <p className="text-xs text-muted-foreground">
              Auto-populated groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empty Groups</CardTitle>
            <Folder className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.empty}</div>
            <p className="text-xs text-muted-foreground">
              Need asset assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Group</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {stats.largest?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.largest?.memberCount || 0} assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Tree */}
      <AssetGroupsClient groups={groups} />
    </div>
  );
}