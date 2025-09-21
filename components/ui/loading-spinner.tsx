'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({
  size = 'default',
  className,
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const spinner = (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen && 'min-h-[200px]',
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

// Inline loading spinner for buttons
function InlineSpinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Loader2
      className={cn('animate-spin h-4 w-4', className)}
      {...props}
    />
  );
}

// Loading overlay for content areas
function LoadingOverlay({
  children,
  isLoading,
  text = 'Loading...'
}: {
  children: React.ReactNode;
  isLoading: boolean;
  text?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
}

export { LoadingSpinner, InlineSpinner, LoadingOverlay };