'use client';

import { useState } from 'react';
import { X, Trash, Tag, FolderPlus, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onTag: () => void;
  onAddToGroup: () => void;
  onExport: () => void;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onTag,
  onAddToGroup,
  onExport,
  className
}: BulkActionBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
          'bg-white border rounded-lg shadow-lg p-4',
          'flex items-center gap-4',
          'animate-in slide-in-from-bottom-5 duration-200',
          className
        )}
      >
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTag}
            className="gap-2"
          >
            <Tag className="h-4 w-4" />
            Tag
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddToGroup}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Add to Group
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} assets?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected assets will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}