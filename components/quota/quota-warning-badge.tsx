'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, XCircle } from 'lucide-react';
import { getQuotaStatus } from '@/lib/types/license';

interface QuotaWarningBadgeProps {
  current: number;
  limit: number | null;
  resource: string;
  className?: string;
  showOnlyWarning?: boolean;
}

export function QuotaWarningBadge({
  current,
  limit,
  resource,
  className,
  showOnlyWarning = true,
}: QuotaWarningBadgeProps) {
  if (!limit) {
    return null; // No limit, no warning needed
  }

  const status = getQuotaStatus(current, limit);
  const percentage = Math.round((current / limit) * 100);

  // Don't show if healthy and showOnlyWarning is true
  if (showOnlyWarning && status === 'healthy') {
    return null;
  }

  const getVariant = () => {
    switch (status) {
      case 'exceeded':
        return 'destructive';
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="h-3 w-3" />;
      case 'critical':
        return <AlertCircle className="h-3 w-3" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'exceeded':
        return `${resource} limit exceeded`;
      case 'critical':
        return `${percentage}% of ${resource} used`;
      case 'warning':
        return `${percentage}% of ${resource} used`;
      default:
        return `${current}/${limit} ${resource}`;
    }
  };

  return (
    <Badge variant={getVariant()} className={cn('gap-1 text-xs', className)}>
      {getIcon()}
      {getMessage()}
    </Badge>
  );
}