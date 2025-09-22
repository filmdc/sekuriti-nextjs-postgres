'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AssetCard } from '@/components/assets/asset-card';
import { AssetGroupTree } from '@/components/assets/asset-group-tree';
import { TagSelector } from '@/components/assets/tag-selector';
import { TagFilter } from '@/components/assets/tag-filter';
import { BulkActionBar } from '@/components/assets/bulk-action-bar';
import { BulkTagDialog } from '@/components/assets/bulk-tag-dialog';
import { BulkGroupDialog } from '@/components/assets/bulk-group-dialog';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  HardDrive,
  AlertTriangle,
  Tag as TagIcon,
  Users,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  bulkDeleteAssetsAction,
  bulkTagAssetsAction,
  bulkAddToGroupAction,
  exportAssetsAction,
  deleteAssetAction
} from '@/lib/actions/assets';
import Link from 'next/link';
import type { Asset } from '@/lib/db/schema-ir';
import type { AssetGroup, Tag } from '@/lib/db/schema-tags';

interface AssetListClientProps {
  assets: Array<{
    asset: Asset;
    tags: Tag[];
    groups: AssetGroup[];
  }>;
  groups: any[];
  tags: Tag[];
  stats: {
    total: number;
    byType: Array<{ type: string; count: number }>;
    byCriticality: Array<{ criticality: string; count: number }>;
    mustContact: number;
    expiringCount: number;
  };
  initialFilters: any;
}

const assetTypeIcons = {
  hardware: HardDrive,
  software: '💻',
  service: '☁️',
  data: '📊',
  personnel: '👥',
  facility: '🏢',
  vendor: '💼',
  contract: '📄'
};

export function AssetListClient({
  assets,
  groups,
  tags,
  stats,
  initialFilters
}: AssetListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [view, setView] = useState<'card' | 'table'>(initialFilters.view || 'card');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(initialFilters.groupId || null);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialFilters.tags || []);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialFilters.sortOrder || 'desc');
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [showBulkGroupDialog, setShowBulkGroupDialog] = useState(false);

  const updateSearchParams = (updates: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`/assets?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSearchParams({ search: formData.get('search') });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(new Set(assets.map(a => a.asset.id)));
    } else {
      setSelectedAssets(new Set());
    }
  };

  const handleSelectAsset = (assetId: number, selected: boolean) => {
    const newSelection = new Set(selectedAssets);
    if (selected) {
      newSelection.add(assetId);
    } else {
      newSelection.delete(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      startTransition(async () => {
        await deleteAssetAction(assetId);
      });
    }
  };

  const handleBulkDelete = async () => {
    startTransition(async () => {
      await bulkDeleteAssetsAction(Array.from(selectedAssets));
      setSelectedAssets(new Set());
    });
  };

  const handleBulkTag = async () => {
    setShowBulkTagDialog(true);
  };

  const handleBulkAddToGroup = async () => {
    setShowBulkGroupDialog(true);
  };

  const handleBulkComplete = () => {
    // Refresh the page to show updated data
    router.refresh();
    setSelectedAssets(new Set());
  };

  const handleExport = async () => {
    const format = confirm('Export as CSV? (Cancel for JSON)') ? 'csv' : 'json';
    const data = await exportAssetsAction(format);

    // Create download
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-export-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    updateSearchParams({ sortBy: column, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.byType.length} types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byCriticality.find(c => c.criticality === 'critical')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Must Contact</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mustContact}</div>
            <p className="text-xs text-muted-foreground">
              During incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringCount}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* Sidebar - Groups */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Asset Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetGroupTree
              groups={groups}
              selectedGroupId={selectedGroup}
              onSelectGroup={(groupId) => {
                setSelectedGroup(groupId);
                updateSearchParams({ group: groupId });
              }}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-9 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      name="search"
                      placeholder="Search assets by name, identifier, vendor..."
                      className="pl-10"
                      defaultValue={initialFilters.search}
                    />
                  </div>
                </form>

                {/* Filter Controls */}
                <div className="flex gap-2">
                  <Select
                    value={initialFilters.type || 'all'}
                    onValueChange={(value) => updateSearchParams({ type: value === 'all' ? null : value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
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

                  <Select
                    value={initialFilters.criticality || 'all'}
                    onValueChange={(value) => updateSearchParams({ criticality: value === 'all' ? null : value })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Criticality</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1 border rounded-md">
                    <Button
                      variant={view === 'card' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => {
                        setView('card');
                        updateSearchParams({ view: 'card' });
                      }}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view === 'table' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => {
                        setView('table');
                        updateSearchParams({ view: 'table' });
                      }}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Extended Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <TagFilter
                    availableTags={tags}
                    selectedTags={selectedTags}
                    onTagsChange={(tagIds) => {
                      setSelectedTags(tagIds);
                      updateSearchParams({ tags: tagIds });
                    }}
                  />
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Assets Display */}
          <Card>
            <CardContent className="p-0">
              {view === 'card' ? (
                <div className="p-6">
                  {/* Selection Controls */}
                  {assets.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedAssets.size === assets.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-gray-600">
                          Select all ({assets.length})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Asset Cards Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {assets.map(({ asset, tags, groups }) => (
                      <AssetCard
                        key={asset.id}
                        asset={{ ...asset, tags, groups }}
                        selected={selectedAssets.has(asset.id)}
                        onSelect={(selected) => handleSelectAsset(asset.id, selected)}
                        onDelete={() => handleDeleteAsset(asset.id)}
                        selectionMode={selectedAssets.size > 0}
                      />
                    ))}
                  </div>

                  {assets.length === 0 && (
                    <div className="text-center py-12">
                      <HardDrive className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
                      <p className="text-gray-500">
                        Try adjusting your filters or add your first asset.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Table View */
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAssets.size === assets.length && assets.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                        Name
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                        Type
                        {sortBy === 'type' && (
                          sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead>Identifier</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('criticality')}>
                        Criticality
                        {sortBy === 'criticality' && (
                          sortOrder === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
                        )}
                      </TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map(({ asset, tags }) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAssets.has(asset.id)}
                            onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <Link href={`/assets/${asset.id}`} className="font-medium hover:underline">
                            {asset.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {asset.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {asset.identifier || '-'}
                        </TableCell>
                        <TableCell>
                          {asset.criticality ? (
                            <Badge variant="outline" className={`
                              ${asset.criticality === 'critical' ? 'bg-red-100 text-red-800' : ''}
                              ${asset.criticality === 'high' ? 'bg-orange-100 text-orange-800' : ''}
                              ${asset.criticality === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${asset.criticality === 'low' ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                              {asset.criticality}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {tags.slice(0, 2).map(tag => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  borderColor: tag.color
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {asset.primaryContact || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/assets/${asset.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="text-red-600"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedAssets.size}
        onClearSelection={() => setSelectedAssets(new Set())}
        onDelete={handleBulkDelete}
        onTag={handleBulkTag}
        onAddToGroup={handleBulkAddToGroup}
        onExport={handleExport}
      />

      {/* Bulk Tag Dialog */}
      <BulkTagDialog
        open={showBulkTagDialog}
        onOpenChange={setShowBulkTagDialog}
        selectedAssetIds={Array.from(selectedAssets)}
        availableTags={tags}
        selectedAssets={assets.filter(({ asset }) => selectedAssets.has(asset.id)).map(({ asset, tags }) => ({ ...asset, tags }))}
        onComplete={handleBulkComplete}
      />

      {/* Bulk Group Dialog */}
      <BulkGroupDialog
        open={showBulkGroupDialog}
        onOpenChange={setShowBulkGroupDialog}
        selectedAssetIds={Array.from(selectedAssets)}
        availableGroups={groups}
        onComplete={handleBulkComplete}
      />
    </>
  );
}