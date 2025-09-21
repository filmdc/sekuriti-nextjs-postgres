'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagManager } from '@/components/assets/tag-manager';
import { TagTemplates } from '@/components/assets/tag-templates';
import { Tag as TagIcon, Zap, Settings } from 'lucide-react';
import type { Asset } from '@/lib/db/schema-ir';
import type { Tag, AssetGroup } from '@/lib/db/schema-tags';

interface AssetDetailClientProps {
  asset: Asset;
  initialTags: Tag[];
  availableTags: Tag[];
  groups: AssetGroup[];
}

export function AssetDetailClient({
  asset,
  initialTags,
  availableTags,
  groups
}: AssetDetailClientProps) {
  const [currentTags, setCurrentTags] = useState<Tag[]>(initialTags);

  const handleApplyTemplate = async (tagIds: number[]) => {
    try {
      const response = await fetch(`/api/assets/${asset.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds })
      });

      if (response.ok) {
        const newTags = availableTags.filter(tag => tagIds.includes(tag.id));
        const uniqueTags = [
          ...currentTags,
          ...newTags.filter(newTag => !currentTags.some(existing => existing.id === newTag.id))
        ];
        setCurrentTags(uniqueTags);
      }
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Tags
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-4">
          <TagManager
            assetId={asset.id}
            currentTags={currentTags}
            availableTags={availableTags}
            onTagsUpdate={setCurrentTags}
            assetType={asset.type}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TagTemplates
            availableTags={availableTags}
            onApplyTemplate={handleApplyTemplate}
            assetType={asset.type}
          />
        </TabsContent>
      </Tabs>

      {/* Groups Display */}
      <div className="border-t pt-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Asset Groups</p>
          {groups && groups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <Badge
                  key={group.id}
                  variant="secondary"
                  style={group.color ? {
                    backgroundColor: `${group.color}20`,
                    borderColor: group.color
                  } : {}}
                >
                  {group.icon && <span className="mr-1">{group.icon}</span>}
                  {group.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not assigned to any groups</p>
          )}
        </div>
      </div>
    </div>
  );
}