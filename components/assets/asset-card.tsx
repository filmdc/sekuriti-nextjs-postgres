'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  HardDrive,
  Code,
  Cloud,
  Database,
  Users,
  Building,
  Briefcase,
  FileText,
  MoreVertical,
  Edit,
  Trash,
  Tag,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import type { Asset } from '@/lib/db/schema-ir';

interface AssetCardProps {
  asset: Asset & {
    tags?: Array<{ id: number; name: string; color: string; category: string }>;
    groups?: Array<{ id: number; name: string; type: string; color?: string }>;
  };
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: () => void;
  selectionMode?: boolean;
}

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

export function AssetCard({ asset, selected = false, onSelect, onDelete, selectionMode = false }: AssetCardProps) {
  const Icon = assetTypeIcons[asset.type] || HardDrive;
  const criticalityClass = asset.criticality ? criticalityColors[asset.criticality as keyof typeof criticalityColors] : '';

  const handleSelect = (checked: boolean) => {
    if (onSelect) {
      onSelect(checked);
    }
  };

  const isExpiring = asset.expiryDate && new Date(asset.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card className={`hover:shadow-lg transition-all cursor-pointer ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {selectionMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={handleSelect}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}
            <div className="flex-1">
              <Link href={`/assets/${asset.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-base font-semibold line-clamp-1">
                    {asset.name}
                  </CardTitle>
                </div>
              </Link>
              {asset.identifier && (
                <p className="text-sm text-gray-500 font-mono">{asset.identifier}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Type and Criticality */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
          </Badge>
          {asset.criticality && (
            <Badge variant="outline" className={`text-xs ${criticalityClass}`}>
              {asset.criticality.charAt(0).toUpperCase() + asset.criticality.slice(1)}
            </Badge>
          )}
          {asset.mustContact && (
            <Badge variant="destructive" className="text-xs">
              Must Contact
            </Badge>
          )}
        </div>

        {/* Expiry Warning */}
        {isExpiring && (
          <div className="flex items-center gap-2 text-orange-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Expires {new Date(asset.expiryDate!).toLocaleDateString()}</span>
          </div>
        )}

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: `${tag.color}20`,
                  borderColor: tag.color,
                  color: tag.color
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Details */}
        <div className="space-y-1 text-sm text-gray-600">
          {asset.vendor && (
            <div className="flex justify-between">
              <span className="text-gray-500">Vendor:</span>
              <span className="font-medium text-gray-700">{asset.vendor}</span>
            </div>
          )}
          {asset.location && (
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span className="font-medium text-gray-700">{asset.location}</span>
            </div>
          )}
          {asset.primaryContact && (
            <div className="flex justify-between">
              <span className="text-gray-500">Contact:</span>
              <span className="font-medium text-gray-700 truncate">{asset.primaryContact}</span>
            </div>
          )}
        </div>

        {/* Groups */}
        {asset.groups && asset.groups.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {asset.groups.slice(0, 2).map((group) => (
                <Badge
                  key={group.id}
                  variant="secondary"
                  className="text-xs"
                  style={group.color ? {
                    backgroundColor: `${group.color}20`,
                    borderColor: group.color
                  } : {}}
                >
                  {group.name}
                </Badge>
              ))}
              {asset.groups.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{asset.groups.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}