'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusIndicator, ThreatLevel } from '@/components/ui/status-indicator';
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
import { cn } from '@/lib/utils';
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

// Modern criticality mapping using our design system
const criticalityMapping = {
  low: 'low' as const,
  medium: 'medium' as const,
  high: 'high' as const,
  critical: 'critical' as const
};

export function AssetCard({ asset, selected = false, onSelect, onDelete, selectionMode = false }: AssetCardProps) {
  const Icon = assetTypeIcons[asset.type] || HardDrive;
  const criticalityStatus = asset.criticality ? criticalityMapping[asset.criticality as keyof typeof criticalityMapping] : null;

  const handleSelect = (checked: boolean) => {
    if (onSelect) {
      onSelect(checked);
    }
  };

  const isExpiring = asset.expiryDate && new Date(asset.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isDaysTillExpiry = asset.expiryDate ? Math.ceil((new Date(asset.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card
      hover
      className={cn(
        'cursor-pointer transition-all',
        selected && 'ring-2 ring-primary shadow-lg'
      )}
    >
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
        <div className="flex items-center gap-space-grid-2 flex-wrap">
          <Badge variant="secondary" size="sm">
            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
          </Badge>
          {criticalityStatus && (
            <StatusBadge status={criticalityStatus} size="sm">
              {asset.criticality!.charAt(0).toUpperCase() + asset.criticality!.slice(1)}
            </StatusBadge>
          )}
          {asset.mustContact && (
            <Badge variant="critical" size="sm" pulse>
              Must Contact
            </Badge>
          )}
        </div>

        {/* Expiry Warning */}
        {isExpiring && (
          <StatusIndicator
            status={isDaysTillExpiry && isDaysTillExpiry <= 7 ? 'critical' : 'warning'}
            variant="minimal"
            size="sm"
            pulse={isDaysTillExpiry && isDaysTillExpiry <= 7}
            message={`Expires ${new Date(asset.expiryDate!).toLocaleDateString()}`}
          />
        )}

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-space-grid-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                size="sm"
                className="transition-all hover-lift"
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
              <Badge variant="outline" size="sm">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Details */}
        <div className="space-y-space-grid-2 text-enterprise-sm text-muted-foreground">
          {asset.vendor && (
            <div className="flex justify-between items-center">
              <span>Vendor:</span>
              <span className="font-medium text-foreground">{asset.vendor}</span>
            </div>
          )}
          {asset.location && (
            <div className="flex justify-between items-center">
              <span>Location:</span>
              <span className="font-medium text-foreground">{asset.location}</span>
            </div>
          )}
          {asset.primaryContact && (
            <div className="flex justify-between items-center">
              <span>Contact:</span>
              <span className="font-medium text-foreground truncate">{asset.primaryContact}</span>
            </div>
          )}
        </div>

        {/* Groups */}
        {asset.groups && asset.groups.length > 0 && (
          <div className="pt-space-grid-3 border-t border-border/50">
            <div className="flex flex-wrap gap-space-grid-1">
              {asset.groups.slice(0, 2).map((group) => (
                <Badge
                  key={group.id}
                  variant="secondary"
                  size="sm"
                  className="transition-all hover-lift"
                  style={group.color ? {
                    backgroundColor: `${group.color}20`,
                    borderColor: group.color
                  } : {}}
                >
                  {group.name}
                </Badge>
              ))}
              {asset.groups.length > 2 && (
                <Badge variant="secondary" size="sm">
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