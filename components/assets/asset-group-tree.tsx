'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreVertical, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AssetGroup } from '@/lib/db/schema-tags';

interface AssetGroupWithChildren extends AssetGroup {
  children?: AssetGroupWithChildren[];
}

interface AssetGroupTreeProps {
  groups: AssetGroupWithChildren[];
  selectedGroupId?: number | null;
  onSelectGroup?: (groupId: number | null) => void;
  onEditGroup?: (group: AssetGroup) => void;
  onDeleteGroup?: (groupId: number) => void;
  onCreateSubgroup?: (parentId: number | null) => void;
  onDrop?: (assetIds: number[], groupId: number) => void;
  draggingAssets?: number[];
}

export function AssetGroupTree({
  groups,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
  onCreateSubgroup,
  onDrop,
  draggingAssets = []
}: AssetGroupTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [dragOverGroup, setDragOverGroup] = useState<number | null>(null);

  const toggleExpanded = (groupId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDragOver = (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroup(groupId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroup(null);

    if (onDrop && draggingAssets.length > 0) {
      onDrop(draggingAssets, groupId);
    }
  };

  const renderGroup = (group: AssetGroupWithChildren, level = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const isSelected = selectedGroupId === group.id;
    const isDragOver = dragOverGroup === group.id;
    const hasChildren = group.children && group.children.length > 0;

    return (
      <div key={group.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors',
            isSelected && 'bg-primary/10 hover:bg-primary/20',
            isDragOver && 'bg-blue-50 ring-2 ring-blue-300'
          )}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
          onClick={() => onSelectGroup?.(group.id)}
          onDragOver={(e) => handleDragOver(e, group.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, group.id)}
        >
          {/* Expand/Collapse Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(group.id);
            }}
            className={cn(
              'p-0.5 hover:bg-gray-200 rounded transition-transform',
              !hasChildren && 'invisible'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Folder Icon */}
          <div className="flex items-center gap-2 flex-1">
            {group.icon ? (
              <span className="text-base">{group.icon}</span>
            ) : isExpanded ? (
              <FolderOpen
                className="h-4 w-4"
                style={{ color: group.color || '#6B7280' }}
              />
            ) : (
              <Folder
                className="h-4 w-4"
                style={{ color: group.color || '#6B7280' }}
              />
            )}

            {/* Group Name */}
            <span className="text-sm font-medium flex-1 truncate">
              {group.name}
            </span>

            {/* Member Count */}
            {group.memberCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {group.memberCount}
              </Badge>
            )}

            {/* Dynamic Badge */}
            {group.isDynamic && (
              <Badge variant="outline" className="text-xs">
                Dynamic
              </Badge>
            )}

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreateSubgroup?.(group.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subgroup
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditGroup?.(group)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteGroup?.(group.id)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div>
            {group.children!.map((child) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* All Assets */}
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100',
          selectedGroupId === null && 'bg-primary/10 hover:bg-primary/20'
        )}
        onClick={() => onSelectGroup?.(null)}
      >
        <div className="w-4" />
        <Folder className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">All Assets</span>
      </div>

      {/* Groups */}
      {groups.map((group) => renderGroup(group))}

      {/* Add Group Button */}
      {onCreateSubgroup && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start pl-2 mt-2"
          onClick={() => onCreateSubgroup(null)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      )}
    </div>
  );
}