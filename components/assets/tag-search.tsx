'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Tag as TagIcon, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  CommandList
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { Tag } from '@/lib/db/schema-tags';

interface TagSearchProps {
  onTagSelect: (tag: Tag) => void;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagSearch({
  onTagSelect,
  onSearchChange,
  placeholder = 'Search by tags...',
  className
}: TagSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);

  // Fetch popular tags on mount
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const response = await fetch('/api/tags?popular=true&limit=5');
        if (response.ok) {
          const data = await response.json();
          setPopularTags(data);
        }
      } catch (error) {
        console.error('Error fetching popular tags:', error);
      }
    };

    fetchPopularTags();
  }, []);

  // Search tags when query changes
  useEffect(() => {
    const searchTags = async () => {
      if (!searchQuery.trim()) {
        setTags([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tags?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (error) {
        console.error('Error searching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTags, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleTagSelect = (tag: Tag) => {
    onTagSelect(tag);
    setSearchQuery('');
    setOpen(false);
  };

  const displayTags = searchQuery.trim() ? tags : popularTags;

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setOpen(true)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery('');
                  setOpen(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Searching tags...
                </div>
              ) : displayTags.length > 0 ? (
                <>
                  {!searchQuery.trim() && (
                    <CommandGroup heading="Popular Tags">
                      {popularTags.map(tag => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleTagSelect(tag)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {tag.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TrendingUp className="h-3 w-3" />
                            {tag.usageCount}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  
                  {searchQuery.trim() && (
                    <CommandGroup heading={`Search Results (${tags.length})`}>
                      {tags.map(tag => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleTagSelect(tag)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span>{tag.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {tag.category}
                            </Badge>
                          </div>
                          {tag.usageCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {tag.usageCount} uses
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              ) : (
                <CommandEmpty>
                  {searchQuery.trim() ? (
                    <div className="p-4 text-center">
                      <TagIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        No tags found for "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <TagIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Start typing to search tags
                      </p>
                    </div>
                  )}
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}