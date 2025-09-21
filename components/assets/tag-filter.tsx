'use client';

import { useState } from 'react';
import { X, Tag as TagIcon, Filter, Settings, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/db/schema-tags';

interface TagFilterProps {
  availableTags: Tag[];
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  className?: string;
  showAdvanced?: boolean;
}

interface TagsByCategory {
  [category: string]: Tag[];
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagsChange,
  className,
  showAdvanced = true
}: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filterMode, setFilterMode] = useState<'any' | 'all'>('any');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Group tags by category
  const tagsByCategory = availableTags.reduce<TagsByCategory>((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {});

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  const handleToggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group filtered tags by category
  const filteredTagsByCategory = filteredTags.reduce<TagsByCategory>((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {});

  const categoryOrder = ['criticality', 'department', 'location', 'compliance', 'incident_type', 'skill', 'custom'];
  const sortedCategories = Object.keys(filteredTagsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className={cn('space-y-2', className)}>
      {/* Filter Options */}
      {showAdvanced && selectedTags.length > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Show assets with:</span>
          <Button
            variant={filterMode === 'any' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('any')}
            className="h-6 px-2"
          >
            Any tags
          </Button>
          <Button
            variant={filterMode === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterMode('all')}
            className="h-6 px-2"
          >
            All tags
          </Button>
        </div>
      )}

      {/* Tag Filter Button */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter by tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
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
              <CommandEmpty>No tags found.</CommandEmpty>
              
              {selectedTags.length > 0 && (
                <>
                  <CommandGroup heading="Selected Tags">
                    {selectedTagObjects.map(tag => (
                      <CommandItem
                        key={`selected-${tag.id}`}
                        onSelect={() => handleRemoveTag(tag.id)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </div>
                        <X className="h-3 w-3" />
                      </CommandItem>
                    ))}
                    <CommandItem onSelect={handleClearAll} className="text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {sortedCategories.map(category => {
                const categoryTags = filteredTagsByCategory[category];
                const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
                
                return (
                  <CommandGroup key={category} heading={categoryLabel}>
                    {categoryTags.map(tag => {
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleToggleTag(tag.id)}
                          className={cn(
                            'flex items-center justify-between',
                            isSelected && 'bg-accent'
                          )}
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
                          {isSelected && (
                            <TagIcon className="h-3 w-3" />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showAdvanced && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="px-2"
        >
          <Settings className="h-4 w-4" />
          <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${
            showAdvancedOptions ? 'rotate-180' : ''
          }`} />
        </Button>
      )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && showAdvancedOptions && (
        <div className="p-3 border rounded-lg bg-gray-50 space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Filter Options</h4>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="filterMode"
                  checked={filterMode === 'any'}
                  onChange={() => setFilterMode('any')}
                  className="text-primary"
                />
                <span>Assets with ANY of the selected tags</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="filterMode"
                  checked={filterMode === 'all'}
                  onChange={() => setFilterMode('all')}
                  className="text-primary"
                />
                <span>Assets with ALL of the selected tags</span>
              </label>
            </div>
          </div>

          {/* Quick Category Filters */}
          <div>
            <h4 className="text-sm font-medium mb-2">Quick Category Filters</h4>
            <div className="flex flex-wrap gap-1">
              {categoryOrder.map(category => {
                const categoryTags = availableTags.filter(tag => tag.category === category);
                if (categoryTags.length === 0) return null;

                return (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => {
                      const categoryTagIds = categoryTags.map(tag => tag.id);
                      const newSelection = [
                        ...selectedTags,
                        ...categoryTagIds.filter(id => !selectedTags.includes(id))
                      ];
                      onTagsChange(newSelection);
                    }}
                  >
                    All {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Tag Filters */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Filtering by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
              {selectedTags.length > 1 && (
                <span className="ml-1 text-xs">({filterMode === 'any' ? 'any match' : 'all must match'})</span>
              )}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map(tag => (
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
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}