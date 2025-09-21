'use client';

import { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Minus, Sparkles } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { TagSelector } from './tag-selector';
import { BulkTagSuggestions } from './bulk-tag-suggestions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import type { Tag } from '@/lib/db/schema-tags';
import type { Asset } from '@/lib/db/schema-ir';

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssetIds: number[];
  availableTags: Tag[];
  selectedAssets?: Array<Asset & { tags?: Tag[] }>;
  onComplete: () => void;
}

export function BulkTagDialog({
  open,
  onOpenChange,
  selectedAssetIds,
  availableTags,
  selectedAssets = [],
  onComplete
}: BulkTagDialogProps) {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');

  const handleCreateTag = async (name: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: 'custom',
          color: '#6B7280'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = await response.json();
      availableTags.push(newTag);
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleBulkTag = async () => {
    if (selectedTags.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one tag',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/assets/bulk-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetIds: selectedAssetIds,
          tagIds: selectedTags,
          action: activeTab
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message || 'Tags updated successfully'
      });
      onComplete();
      onOpenChange(false);
      setSelectedTags([]);
    } catch (error) {
      console.error('Error bulk tagging:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tags',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Bulk Tag Assets
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'add' ? 'Add tags to' : 'Remove tags from'} {selectedAssetIds.length} selected asset{selectedAssetIds.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'add' | 'remove');
          setSelectedTags([]);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Tags
            </TabsTrigger>
            <TabsTrigger value="remove" className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              Remove Tags
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Smart Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Select tags to add to all selected assets:
              </p>
              <TagSelector
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                onCreateTag={handleCreateTag}
                placeholder="Select tags to add..."
                multiple={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Select tags to remove from all selected assets:
              </p>
              <TagSelector
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                placeholder="Select tags to remove..."
                multiple={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <BulkTagSuggestions
              selectedAssets={selectedAssets}
              availableTags={availableTags}
              onApplySuggestion={(tagIds, description) => {
                setSelectedTags(tagIds);
                setActiveTab('add');
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Selected Tags Preview */}
        {selectedTags.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              {activeTab === 'add' ? 'Tags to add' : 'Tags to remove'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTagObjects.map(tag => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          {activeTab !== 'suggestions' && (
            <Button
              onClick={handleBulkTag}
              disabled={selectedTags.length === 0 || isProcessing}
            >
              {isProcessing ? 'Processing...' : (
                activeTab === 'add' ? `Add Tags` : `Remove Tags`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}