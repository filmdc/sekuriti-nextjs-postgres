'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Filter, SortAsc } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ExerciseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...categories, category]
      : categories.filter((c) => c !== category);
    setCategories(newCategories);
    updateURL(newCategories, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL(categories, newSort);
  };

  const updateURL = (cats: string[], sort: string) => {
    const params = new URLSearchParams();
    if (cats.length > 0) params.set('categories', cats.join(','));
    if (sort !== 'newest') params.set('sort', sort);

    const queryString = params.toString();
    router.push(`/exercises${queryString ? `?${queryString}` : ''}`);
  };

  const clearFilters = () => {
    setCategories([]);
    setSortBy('newest');
    router.push('/exercises');
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {categories.length > 0 && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {categories.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={categories.includes('malware')}
            onCheckedChange={(checked) => handleCategoryChange('malware', checked)}
          >
            Malware
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={categories.includes('phishing')}
            onCheckedChange={(checked) => handleCategoryChange('phishing', checked)}
          >
            Phishing
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={categories.includes('data_breach')}
            onCheckedChange={(checked) => handleCategoryChange('data_breach', checked)}
          >
            Data Breach
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={categories.includes('ddos')}
            onCheckedChange={(checked) => handleCategoryChange('ddos', checked)}
          >
            DDoS
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={categories.includes('ransomware')}
            onCheckedChange={(checked) => handleCategoryChange('ransomware', checked)}
          >
            Ransomware
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={clearFilters}>
            Clear filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <SortAsc className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSortChange('newest')}>
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('popular')}>
            Most Popular
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('difficulty-asc')}>
            Difficulty (Easy → Hard)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('difficulty-desc')}>
            Difficulty (Hard → Easy)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange('duration')}>
            Shortest Duration
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}