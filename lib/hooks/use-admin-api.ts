import useSWR, { SWRConfiguration } from 'swr';
import { toast } from '@/components/ui/use-toast';

// Custom fetcher for admin API endpoints
const adminFetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

// Custom hook for admin API data fetching
export function useAdminAPI<T = any>(
  endpoint: string | null,
  options?: SWRConfiguration
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    endpoint,
    adminFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Auto refresh every 30 seconds
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isError: !!error,
  };
}

// Helper function for admin API mutations
export async function adminAPI(
  endpoint: string,
  options?: {
    method?: string;
    body?: any;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const { method = 'GET', body, successMessage, errorMessage } = options || {};

  try {
    const response = await fetch(endpoint, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    const data = await response.json();

    if (successMessage) {
      toast({
        title: 'Success',
        description: successMessage,
      });
    }

    return data;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : errorMessage || 'An error occurred';

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });

    throw error;
  }
}