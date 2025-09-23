'use client';

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, X } from 'lucide-react';
import { QuotaError, FeatureError } from '@/lib/types/license';
import Link from 'next/link';

interface QuotaErrorAlertProps {
  error: QuotaError | FeatureError | null;
  onDismiss?: () => void;
  showUpgradeButton?: boolean;
  className?: string;
}

export function QuotaErrorAlert({
  error,
  onDismiss,
  showUpgradeButton = true,
  className,
}: QuotaErrorAlertProps) {
  if (!error) return null;

  const isQuotaError = error.code === 'QUOTA_EXCEEDED';
  const isFeatureError = error.code === 'FEATURE_RESTRICTED';

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {isQuotaError ? 'Quota Exceeded' : 'Feature Restricted'}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={onDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error.message}</p>
        {isQuotaError && (
          <p className="text-sm">
            Current usage: {(error as QuotaError).current} / {(error as QuotaError).limit}{' '}
            {(error as QuotaError).resource}
          </p>
        )}
        {isFeatureError && (
          <p className="text-sm">
            This feature requires a {(error as FeatureError).requiredLicense} plan or higher.
          </p>
        )}
        {showUpgradeButton && (error.upgradeUrl || '/pricing') && (
          <Button size="sm" className="mt-2" asChild>
            <Link href={error.upgradeUrl || '/pricing'}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}