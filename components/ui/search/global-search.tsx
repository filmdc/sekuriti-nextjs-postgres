'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Search,
  AlertTriangle,
  Package,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Clock,
  Filter,
  X
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  id: string;
  type: 'incident' | 'asset' | 'runbook' | 'communication' | 'exercise';
  title: string;
  description?: string;
  url: string;
  metadata?: {
    status?: string;
    severity?: string;
    category?: string;
    referenceNumber?: string;
  };
  lastModified?: Date;
}

interface GlobalSearchProps {
  trigger?: React.ReactNode;
  onResultSelect?: (result: SearchResult) => void;
}

const typeConfig = {
  incident: {
    icon: AlertTriangle,
    label: 'Incidents',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  asset: {
    icon: Package,
    label: 'Assets',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  runbook: {
    icon: BookOpen,
    label: 'Runbooks',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  communication: {
    icon: MessageSquare,
    label: 'Communications',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  exercise: {
    icon: GraduationCap,
    label: 'Training',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
};

const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'incident',
    title: 'Phishing Email Campaign Detected',
    description: 'Multiple users reported suspicious emails from external domain',
    url: '/incidents/1',
    metadata: {
      status: 'open',
      severity: 'high',
      referenceNumber: 'INC-202501-0001'
    },
    lastModified: new Date('2025-01-15T10:30:00Z')
  },
  {
    id: '2',
    type: 'asset',
    title: 'Production Database Server',
    description: 'Primary PostgreSQL server hosting customer data',
    url: '/assets/2',
    metadata: {
      status: 'active',
      category: 'database'
    },
    lastModified: new Date('2025-01-14T15:45:00Z')
  },
  {
    id: '3',
    type: 'runbook',
    title: 'Incident Response - Data Breach',
    description: 'Standard operating procedure for handling data breach incidents',
    url: '/runbooks/3',
    metadata: {
      category: 'incident-response'
    },
    lastModified: new Date('2025-01-13T09:20:00Z')
  }
];

export function GlobalSearch({ trigger, onResultSelect }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Mock search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Filter mock results based on query and active filters
    const filtered = mockResults.filter(result => {
      const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          result.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(result.type);
      return matchesQuery && matchesFilter;
    });

    setResults(filtered);
    setIsLoading(false);
  }, [activeFilters]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('sekuriti-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    // Save to recent searches
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('sekuriti-recent-searches', JSON.stringify(updated));
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type)
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="relative w-full lg:w-64 justify-start">
            <Search className="mr-2 h-4 w-4" />
            Search...
            <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Search Sekuriti</DialogTitle>
        </DialogHeader>

        <Command className="rounded-lg border-none shadow-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search incidents, assets, runbooks..."
              value={query}
              onValueChange={handleSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-1 flex-1">
              {Object.entries(typeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  variant={activeFilters.includes(type) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter(type)}
                  className="h-6 text-xs"
                >
                  <config.icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Button>
              ))}
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            {!query && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSearch(search)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{search}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <CommandEmpty>No results found for "{query}"</CommandEmpty>
            )}

            {!isLoading && results.length > 0 && (
              <>
                {Object.entries(typeConfig).map(([type, config]) => {
                  const typeResults = results.filter(r => r.type === type);
                  if (typeResults.length === 0) return null;

                  return (
                    <CommandGroup key={type} heading={config.label}>
                      {typeResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleResultClick(result)}
                          className="flex items-start gap-3 p-3"
                        >
                          <div className={`p-1.5 rounded-full ${config.bgColor} flex-shrink-0`}>
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{result.title}</span>
                              {result.metadata?.status && (
                                <Badge variant="outline" className="text-xs">
                                  {result.metadata.status}
                                </Badge>
                              )}
                              {result.metadata?.severity && (
                                <Badge
                                  variant={result.metadata.severity === 'critical' || result.metadata.severity === 'high' ? 'destructive' : 'outline'}
                                  className="text-xs"
                                >
                                  {result.metadata.severity}
                                </Badge>
                              )}
                            </div>
                            {result.description && (
                              <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                {result.description}
                              </p>
                            )}
                            {result.metadata?.referenceNumber && (
                              <span className="text-xs text-gray-500">
                                {result.metadata.referenceNumber}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}