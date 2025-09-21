'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon, Check, Sparkles, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/db/schema-tags';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  onCreateTag?: (name: string) => Promise<Tag>;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
  showSuggestions?: boolean;
  assetType?: string;
}

export function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  placeholder = 'Select tags...',
  multiple = true,
  className,
  showSuggestions = true,
  assetType
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  const handleSelect = (tagId: number) => {
    if (multiple) {
      if (selectedTags.includes(tagId)) {
        onTagsChange(selectedTags.filter(id => id !== tagId));
      } else {
        onTagsChange([...selectedTags, tagId]);
      }
    } else {
      onTagsChange([tagId]);
      setOpen(false);
    }
  };

  const handleRemove = (tagId: number) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!searchValue.trim() || !onCreateTag) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(searchValue.trim());
      handleSelect(newTag.id);
      setSearchValue('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTags = availableTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = !filterCategory || tag.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get suggested tags based on asset type
  const getSuggestedTags = () => {
    if (!showSuggestions || !assetType) return [];

    const suggestions: Record<string, string[]> = {
      hardware: ['production', 'critical', 'physical'],
      software: ['application', 'development', 'production'],
      service: ['cloud', 'external', 'managed'],
      data: ['sensitive', 'backup', 'archive'],
      personnel: ['contact', 'emergency', 'expert'],
      facility: ['physical', 'location', 'secure'],
      vendor: ['third-party', 'contract', 'managed'],
      contract: ['legal', 'renewal', 'compliance']
    };

    const relevantKeywords = suggestions[assetType] || [];
    return availableTags.filter(tag =>
      relevantKeywords.some(keyword =>
        tag.name.toLowerCase().includes(keyword) ||
        tag.category === 'criticality' ||
        tag.category === 'department'
      ) && !selectedTags.includes(tag.id)
    ).slice(0, 3);
  };

  const suggestedTags = getSuggestedTags();

  const tagCategories = Array.from(new Set(availableTags.map(tag => tag.category)));

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <TagIcon className="h-4 w-4 mr-2" />
            {selectedTagObjects.length > 0 ? (
              <span className="truncate">
                {selectedTagObjects.length} tag{selectedTagObjects.length > 1 ? 's' : ''} selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {onCreateTag && searchValue && (
                  <div className="p-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleCreateTag}
                      disabled={isCreating}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create "{searchValue}"
                    </Button>
                  </div>
                )}
                {!onCreateTag && 'No tags found.'}
              </CommandEmpty>

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && !searchValue && (
                <CommandGroup heading="Suggested for this asset">
                  {suggestedTags.map(tag => (
                    <CommandItem
                      key={`suggested-${tag.id}`}
                      onSelect={() => handleSelect(tag.id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                        <span className="text-xs text-gray-500">
                          ({tag.category})
                        </span>
                      </div>
                      {selectedTags.includes(tag.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Category Filter */}
              {!searchValue && (
                <div className="px-2 py-1 border-b">
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant={filterCategory === null ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setFilterCategory(null)}
                    >
                      All
                    </Button>
                    {tagCategories.map(category => (
                      <Button
                        key={category}
                        variant={filterCategory === category ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setFilterCategory(filterCategory === category ? null : category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {tagCategories.map(category => {
                const categoryTags = filteredTags.filter(tag => tag.category === category);
                if (categoryTags.length === 0) return null;

                return (
                  <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}>
                    {categoryTags.map(tag => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleSelect(tag.id)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                          {tag.usageCount > 0 && (
                            <span className="text-xs text-gray-500">
                              ({tag.usageCount})
                            </span>
                          )}
                        </div>
                        {selectedTags.includes(tag.id) && (
                          <Check className="h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTagObjects.length > 0 && (
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
              {tag.name}
              {multiple && (
                <button
                  onClick={() => handleRemove(tag.id)}
                  className="ml-2 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}