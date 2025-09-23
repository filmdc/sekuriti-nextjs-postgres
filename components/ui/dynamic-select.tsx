'use client';

import { useDropdownOptions } from '@/lib/hooks/useDropdowns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DynamicSelectProps {
  dropdownKey: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showDescription?: boolean;
  required?: boolean;
}

export function DynamicSelect({
  dropdownKey,
  value,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
  showDescription = false,
  required = false,
}: DynamicSelectProps) {
  const { options, isLoading, error, hasFallback } = useDropdownOptions(dropdownKey);

  if (isLoading && !hasFallback) {
    return <Skeleton className={cn('h-10 w-full', className)} />;
  }

  if (error && !hasFallback) {
    return (
      <Select disabled>
        <SelectTrigger className={cn('text-muted-foreground', className)}>
          <SelectValue placeholder="Failed to load options" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || (options.length === 0)}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="py-2 px-3 text-sm text-muted-foreground">
            No options available
          </div>
        ) : (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                {showDescription && option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
        {error && hasFallback && (
          <div className="py-1 px-3 text-xs text-amber-600 border-t">
            Using offline options
          </div>
        )}
      </SelectContent>
    </Select>
  );
}