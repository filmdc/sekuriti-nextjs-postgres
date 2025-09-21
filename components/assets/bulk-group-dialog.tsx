'use client';

import { useState } from 'react';
import { FolderPlus, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { AssetGroup } from '@/lib/db/schema-tags';

interface BulkGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssetIds: number[];
  availableGroups: AssetGroup[];
  onComplete: () => void;
}

export function BulkGroupDialog({
  open,
  onOpenChange,
  selectedAssetIds,
  availableGroups,
  onComplete
}: BulkGroupDialogProps) {
  const { toast } = useToast();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAddToGroup = async () => {
    if (!selectedGroupId) {
      toast({
        title: 'Error',
        description: 'Please select a group',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/assets/bulk-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssetIds,
          groupId: parseInt(selectedGroupId)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add assets to group');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message || 'Assets added to group successfully'
      });
      onComplete();
      onOpenChange(false);
      setSelectedGroupId('');
    } catch (error) {
      console.error('Error adding assets to group:', error);
      toast({
        title: 'Error',
        description: 'Failed to add assets to group',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedGroup = availableGroups.find(g => g.id.toString() === selectedGroupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Add to Asset Group
          </DialogTitle>
          <DialogDescription>
            Add {selectedAssetIds.length} selected asset{selectedAssetIds.length > 1 ? 's' : ''} to a group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Group
            </label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a group..." />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    <div className="flex items-center gap-2">
                      {group.icon ? (
                        <span>{group.icon}</span>
                      ) : (
                        <Folder className="h-4 w-4" />
                      )}
                      <span>{group.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.memberCount || 0} members
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGroup && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-start gap-2">
                {selectedGroup.icon ? (
                  <span className="text-lg">{selectedGroup.icon}</span>
                ) : (
                  <Folder className="h-4 w-4 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{selectedGroup.name}</h4>
                  {selectedGroup.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedGroup.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedGroup.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedGroup.memberCount || 0} current members
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {availableGroups.length === 0 && (
            <div className="text-center py-6">
              <Folder className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                No asset groups available
              </p>
              <p className="text-xs text-gray-400">
                Create an asset group first to organize your assets
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkAddToGroup}
            disabled={!selectedGroupId || isProcessing || availableGroups.length === 0}
          >
            {isProcessing ? 'Adding...' : 'Add to Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}