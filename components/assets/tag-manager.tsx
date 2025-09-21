'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Tag as TagIcon, Edit, Trash2, Save, MoreVertical, Zap, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TagSelector } from './tag-selector';
import { useToast } from '@/components/ui/use-toast';
import type { Tag } from '@/lib/db/schema-tags';

interface TagManagerProps {
  assetId: number;
  currentTags: Tag[];
  availableTags: Tag[];
  onTagsUpdate: (tags: Tag[]) => void;
  assetType?: string;
  className?: string;
}

interface TagFormData {
  name: string;
  category: string;
  color: string;
  description?: string;
}

const TAG_CATEGORIES = [
  { value: 'location', label: 'Location' },
  { value: 'department', label: 'Department' },
  { value: 'criticality', label: 'Criticality' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'incident_type', label: 'Incident Type' },
  { value: 'skill', label: 'Skill' },
  { value: 'custom', label: 'Custom' }
];

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#111827'
];

export function TagManager({
  assetId,
  currentTags,
  availableTags,
  onTagsUpdate,
  assetType,
  className
}: TagManagerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useState<number[]>(currentTags.map(tag => tag.id));
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [newTagForm, setNewTagForm] = useState<TagFormData>({
    name: '',
    category: 'custom',
    color: PRESET_COLORS[0],
    description: ''
  });

  const handleTagsChange = async (tagIds: number[]) => {
    const previousTags = [...selectedTags];
    setSelectedTags(tagIds);

    // Determine which tags to add and remove
    const toAdd = tagIds.filter(id => !previousTags.includes(id));
    const toRemove = previousTags.filter(id => !tagIds.includes(id));

    try {
      // Add new tags
      if (toAdd.length > 0) {
        const response = await fetch(`/api/assets/${assetId}/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: toAdd })
        });

        if (!response.ok) {
          throw new Error('Failed to add tags');
        }
      }

      // Remove tags
      if (toRemove.length > 0) {
        const response = await fetch(`/api/assets/${assetId}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: toRemove })
        });

        if (!response.ok) {
          throw new Error('Failed to remove tags');
        }
      }

      // Update the parent component with new tags
      const updatedTags = availableTags.filter(tag => tagIds.includes(tag.id));
      onTagsUpdate(updatedTags);
      toast({
        title: 'Success',
        description: 'Tags updated successfully'
      });
    } catch (error) {
      console.error('Error updating tags:', error);
      setSelectedTags(previousTags); // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update tags',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTag = async (name: string) => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: newTagForm.category,
          color: newTagForm.color,
          description: newTagForm.description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = await response.json();
      
      // Add the new tag to available tags and select it
      availableTags.push(newTag);
      setSelectedTags([...selectedTags, newTag.id]);
      handleTagsChange([...selectedTags, newTag.id]);
      
      setShowCreateDialog(false);
      setNewTagForm({
        name: '',
        category: 'custom',
        color: PRESET_COLORS[0],
        description: ''
      });
      
      toast({
        title: 'Success',
        description: 'Tag created successfully'
      });
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

  const handleQuickRemove = async (tagId: number) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}/tags`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagIds: [tagId] })
        });

        if (!response.ok) {
          throw new Error('Failed to remove tag');
        }

        const newSelectedTags = selectedTags.filter(id => id !== tagId);
        setSelectedTags(newSelectedTags);
        
        const updatedTags = availableTags.filter(tag => newSelectedTags.includes(tag.id));
        onTagsUpdate(updatedTags);
        toast({
          title: 'Success',
          description: 'Tag removed successfully'
        });
      } catch (error) {
        console.error('Error removing tag:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove tag',
          variant: 'destructive'
        });
      }
    });
  };

  const currentTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current Tags Display */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Current Tags</Label>
          {currentTagObjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentTagObjects.map(tag => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-sm flex items-center gap-1 pr-1"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                >
                  <TagIcon className="h-3 w-3" />
                  {tag.name}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0.5 ml-1 hover:bg-red-100"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          setEditingTag(tag);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit Tag
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleQuickRemove(tag.id)}
                        className="text-red-600"
                      >
                        <X className="h-3 w-3 mr-2" />
                        Remove from Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags assigned</p>
          )}
        </div>

        {/* Tag Selector */}
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          onCreateTag={handleCreateTag}
          placeholder="Add tags to this asset..."
          multiple={true}
          assetType={assetType}
        />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Create a new tag to categorize your assets.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tagName">Tag Name</Label>
                  <Input
                    id="tagName"
                    value={newTagForm.name}
                    onChange={(e) => setNewTagForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter tag name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tagCategory">Category</Label>
                  <Select 
                    value={newTagForm.category} 
                    onValueChange={(value) => setNewTagForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tagColor">Color</Label>
                  <div className="flex gap-2 mt-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTagForm.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tagDescription">Description (Optional)</Label>
                  <Textarea
                    id="tagDescription"
                    value={newTagForm.description}
                    onChange={(e) => setNewTagForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when to use this tag"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleCreateTag(newTagForm.name)}
                  disabled={!newTagForm.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Action Buttons */}
        {showQuickActions && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const criticalityTags = availableTags.filter(tag => tag.category === 'criticality');
                  if (criticalityTags.length > 0) {
                    const tagIds = criticalityTags.map(tag => tag.id);
                    handleTagsChange([...selectedTags, ...tagIds.filter(id => !selectedTags.includes(id))]);
                  }
                }}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                Add Criticality Tags
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const departmentTags = availableTags.filter(tag => tag.category === 'department');
                  if (departmentTags.length > 0) {
                    const tagIds = departmentTags.map(tag => tag.id);
                    handleTagsChange([...selectedTags, ...tagIds.filter(id => !selectedTags.includes(id))]);
                  }
                }}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                Add Department Tags
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const locationTags = availableTags.filter(tag => tag.category === 'location');
                  if (locationTags.length > 0) {
                    const tagIds = locationTags.map(tag => tag.id);
                    handleTagsChange([...selectedTags, ...tagIds.filter(id => !selectedTags.includes(id))]);
                  }
                }}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                Add Location Tags
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Copy current tags to clipboard
                  const tagNames = currentTagObjects.map(tag => tag.name).join(', ');
                  navigator.clipboard.writeText(tagNames);
                  toast({
                    title: 'Copied to clipboard',
                    description: 'Tag names copied to clipboard'
                  });
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Tag Names
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Quick actions help you apply common tag combinations to this asset.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}