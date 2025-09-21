'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'button' | 'card';
  lines?: number;
}

function Skeleton({
  className,
  variant = 'default',
  lines = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-800";

  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
    button: "rounded-md h-10",
    card: "rounded-lg"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses.text,
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton variant="circular" className="h-8 w-8" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex justify-between">
        <Skeleton variant="button" className="w-20 h-8" />
        <Skeleton variant="button" className="w-16 h-8" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-6 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton variant="circular" className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton variant="button" className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList };