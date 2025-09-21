'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Building,
  Calendar,
  User,
  Plus,
  Search,
  HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Variable {
  key: string;
  label: string;
  example: string;
}

interface VariableAutocompleteProps {
  variables: Record<string, Variable[]>;
  isOpen: boolean;
  onSelect: (variable: string) => void;
  onClose: () => void;
  searchQuery?: string;
  position?: { top: number; left: number };
}

const CATEGORY_ICONS = {
  incident: AlertTriangle,
  organization: Building,
  user: User,
  asset: HardDrive,
  datetime: Calendar,
};

const CATEGORY_COLORS = {
  incident: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
  organization: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
  user: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
  asset: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
  datetime: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
};

export function VariableAutocomplete({
  variables,
  isOpen,
  onSelect,
  onClose,
  searchQuery = '',
  position = { top: 0, left: 0 }
}: VariableAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredVariables, setFilteredVariables] = useState<Array<Variable & { category: string }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Flatten and filter variables based on search query
  useEffect(() => {
    const allVars: Array<Variable & { category: string }> = [];

    Object.entries(variables).forEach(([category, vars]) => {
      vars.forEach(variable => {
        allVars.push({ ...variable, category });
      });
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = allVars.filter(variable => {
        const keyMatch = variable.key.toLowerCase().includes(query);
        const labelMatch = variable.label.toLowerCase().includes(query);
        const categoryMatch = variable.category.toLowerCase().includes(query);
        // Score matches for better ranking
        const keyStartsMatch = variable.key.toLowerCase().startsWith(query);
        const fieldMatch = variable.key.split('.')[1]?.toLowerCase().includes(query);

        return keyMatch || labelMatch || categoryMatch || keyStartsMatch || fieldMatch;
      }).sort((a, b) => {
        // Prioritize exact key matches, then key starts with, then other matches
        const aKeyStarts = a.key.toLowerCase().startsWith(query);
        const bKeyStarts = b.key.toLowerCase().startsWith(query);
        const aKeyExact = a.key.toLowerCase() === query;
        const bKeyExact = b.key.toLowerCase() === query;

        if (aKeyExact && !bKeyExact) return -1;
        if (!aKeyExact && bKeyExact) return 1;
        if (aKeyStarts && !bKeyStarts) return -1;
        if (!aKeyStarts && bKeyStarts) return 1;

        return a.key.localeCompare(b.key);
      });
      setFilteredVariables(filtered);
    } else {
      // Sort by category then by key for better organization
      const sorted = allVars.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.key.localeCompare(b.key);
      });
      setFilteredVariables(sorted);
    }

    setSelectedIndex(0);
  }, [variables, searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = prev < filteredVariables.length - 1 ? prev + 1 : 0;
            // Scroll to selected item
            setTimeout(() => {
              const selectedElement = document.querySelector(`[data-variable-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : filteredVariables.length - 1;
            // Scroll to selected item
            setTimeout(() => {
              const selectedElement = document.querySelector(`[data-variable-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }, 0);
            return newIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            onSelect(filteredVariables[selectedIndex].key);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredVariables, onSelect, onClose]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || filteredVariables.length === 0) {
    return null;
  }

  return (
    <Card
      ref={cardRef}
      className="absolute z-50 w-80 max-h-64 shadow-lg border"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <CardContent className="p-0">
        <div className="p-2 border-b bg-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Search className="h-3 w-3" />
            <span>
              {searchQuery ? `Searching for "${searchQuery}"` : 'Available variables'}
            </span>
            <span className="ml-auto">
              {filteredVariables.length} found
            </span>
          </div>
        </div>

        <ScrollArea className="max-h-48">
          <div className="p-1">
            {filteredVariables.map((variable, index) => {
              const Icon = CATEGORY_ICONS[variable.category as keyof typeof CATEGORY_ICONS];
              const isSelected = index === selectedIndex;

              return (
                <Button
                  key={variable.key}
                  ref={isSelected ? selectedItemRef : undefined}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-2 text-left font-normal transition-colors",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => onSelect(variable.key)}
                  data-variable-index={index}
                >
                  <div className="flex items-start gap-2 w-full">
                    {Icon && (
                      <Icon className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {`{{${variable.key}}}`}
                        </code>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs capitalize",
                            CATEGORY_COLORS[variable.category as keyof typeof CATEGORY_COLORS]
                          )}
                        >
                          {variable.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {variable.label}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Example: {variable.example}
                      </p>
                    </div>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-2 border-t bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use arrow keys to navigate</span>
            <span>Enter to insert</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}