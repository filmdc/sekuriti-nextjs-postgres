'use client';

import useSWR from 'swr';
import { OrganizationLimits, QuotaError, FeatureError } from '@/lib/types/license';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    // Check for quota or feature errors
    if (error.code === 'QUOTA_EXCEEDED' || error.code === 'FEATURE_RESTRICTED') {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch');
  }
  return response.json();
};

export function useOrganizationLimits() {
  const { data, error, isLoading, mutate } = useSWR<OrganizationLimits>(
    '/api/organization/limits',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    limits: data,
    error,
    isLoading,
    refresh: mutate,
  };
}

export function useOrganizationUsage() {
  const { data, error, isLoading, mutate } = useSWR<{
    users: number;
    incidents: number;
    assets: number;
    runbooks: number;
    templates: number;
    storageMb: number;
  }>('/api/organization/usage', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  return {
    usage: data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook to handle quota errors
export function useQuotaError(error: any) {
  const isQuotaError = error?.code === 'QUOTA_EXCEEDED';
  const isFeatureError = error?.code === 'FEATURE_RESTRICTED';

  const quotaError: QuotaError | null = isQuotaError ? error : null;
  const featureError: FeatureError | null = isFeatureError ? error : null;

  return {
    isQuotaError,
    isFeatureError,
    quotaError,
    featureError,
    error: quotaError || featureError || error,
  };
}