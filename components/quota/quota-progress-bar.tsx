'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getQuotaStatus } from '@/lib/types/license';

interface QuotaProgressBarProps {
  current: number;
  limit: number | null;
  label?: string;
  showValues?: boolean;
  showIcon?: boolean;
  className?: string;
  formatter?: (value: number) => string;
}

export function QuotaProgressBar({
  current,
  limit,
  label,
  showValues = true,
  showIcon = true,
  className,
  formatter = (v) => v.toString(),
}: QuotaProgressBarProps) {
  if (!limit) {
    // Unlimited quota
    return (
      <div className={cn('space-y-1', className)}>
        {label && <p className="text-sm font-medium">{label}</p>}
        <div className="flex items-center gap-2">
          {showIcon && <CheckCircle className="h-4 w-4 text-green-500" />}
          <span className="text-sm text-muted-foreground">
            {formatter(current)} (Unlimited)
          </span>
        </div>
      </div>
    );
  }

  const percentage = Math.min(100, (current / limit) * 100);
  const status = getQuotaStatus(current, limit);

  const getStatusColor = () => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-500';
      case 'critical':
        return 'bg-orange-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValues) && (
        <div className="flex items-center justify-between">
          {label && <p className="text-sm font-medium">{label}</p>}
          {showValues && (
            <div className="flex items-center gap-1">
              {showIcon && getStatusIcon()}
              <span className="text-sm text-muted-foreground">
                {formatter(current)} / {formatter(limit)}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="relative">
        <Progress
          value={percentage}
          className="h-2 w-full"
          indicatorClassName={getStatusColor()}
        />
        {percentage >= 80 && (
          <div
            className="absolute top-0 h-full w-px bg-foreground/20"
            style={{ left: '80%' }}
          />
        )}
        {percentage >= 90 && (
          <div
            className="absolute top-0 h-full w-px bg-foreground/30"
            style={{ left: '90%' }}
          />
        )}
      </div>
      {status === 'exceeded' && (
        <p className="text-xs text-red-500 mt-1">
          Quota exceeded. Please upgrade your plan.
        </p>
      )}
      {status === 'critical' && (
        <p className="text-xs text-orange-500 mt-1">
          {Math.round(100 - percentage)}% quota remaining.
        </p>
      )}
    </div>
  );
}