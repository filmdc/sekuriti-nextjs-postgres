'use client';

import React, { useState, useCallback } from 'react';
import { useFeedback } from '@/components/feedback/feedback-provider';

interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingKey?: string;
  showToasts?: boolean;
}

interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
  data: any;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsyncOperation<T = any, P extends any[] = any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    loadingKey,
    showToasts = true
  } = options;

  const { showSuccess, showError, setLoading } = useFeedback();

  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    data: null,
    isSuccess: false,
    isError: false
  });

  const execute = useCallback(async (...args: P) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false
    }));

    if (loadingKey) {
      setLoading(loadingKey, true);
    }

    try {
      const result = await asyncFunction(...args);

      setState({
        isLoading: false,
        error: null,
        data: result,
        isSuccess: true,
        isError: false
      });

      if (showToasts && successMessage) {
        showSuccess(successMessage);
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      setState({
        isLoading: false,
        error: errorObj,
        data: null,
        isSuccess: false,
        isError: true
      });

      if (showToasts && (errorMessage || errorObj.message)) {
        showError(errorMessage || errorObj.message);
      }

      onError?.(errorObj);
      throw errorObj;
    } finally {
      if (loadingKey) {
        setLoading(loadingKey, false);
      }
    }
  }, [asyncFunction, onSuccess, onError, successMessage, errorMessage, loadingKey, showToasts, showSuccess, showError, setLoading]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      isSuccess: false,
      isError: false
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Specialized hook for mutations (create, update, delete operations)
export function useMutation<T = any, P extends any[] = any[]>(
  mutationFunction: (...args: P) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const asyncOp = useAsyncOperation(mutationFunction, {
    showToasts: true,
    ...options
  });

  return {
    ...asyncOp,
    mutate: asyncOp.execute,
    isPending: asyncOp.isLoading
  };
}

// Hook for queries with optional caching
interface UseQueryOptions extends UseAsyncOperationOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
}

export function useQuery<T = any, P extends any[] = any[]>(
  queryKey: string,
  queryFunction: (...args: P) => Promise<T>,
  args: P,
  options: UseQueryOptions = {}
) {
  const {
    enabled = true,
    refetchOnMount = true,
    staleTime = 0,
    ...asyncOptions
  } = options;

  const asyncOp = useAsyncOperation(queryFunction, {
    showToasts: false,
    ...asyncOptions
  });

  // Simple caching mechanism
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

  const executeQuery = useCallback(async () => {
    const cached = cache.get(queryKey);
    const now = Date.now();

    // Return cached data if still fresh
    if (cached && (now - cached.timestamp) < staleTime) {
      // Update state with cached data
      asyncOp.reset();
      return cached.data;
    }

    try {
      const result = await asyncOp.execute(...args);
      setCache(prev => new Map(prev).set(queryKey, { data: result, timestamp: now }));
      return result;
    } catch (error) {
      throw error;
    }
  }, [queryKey, cache, staleTime, asyncOp, args]);

  // Auto-execute on mount if enabled
  React.useEffect(() => {
    if (enabled && refetchOnMount) {
      executeQuery();
    }
  }, [enabled, refetchOnMount, executeQuery]);

  return {
    ...asyncOp,
    refetch: executeQuery,
    invalidate: () => {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(queryKey);
        return newCache;
      });
    }
  };
}

// Hook for handling file uploads with progress
interface UseFileUploadOptions extends UseAsyncOperationOptions {
  onProgress?: (progress: number) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

export function useFileUpload(
  uploadFunction: (file: File, progressCallback?: (progress: number) => void) => Promise<any>,
  options: UseFileUploadOptions = {}
) {
  const { onProgress, acceptedTypes, maxSize, ...asyncOptions } = options;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const asyncOp = useAsyncOperation(uploadFunction, asyncOptions);

  const validateFile = useCallback((file: File): string | null => {
    if (acceptedTypes && !acceptedTypes.some(type => file.type.match(type))) {
      return `File type ${file.type} is not allowed`;
    }

    if (maxSize && file.size > maxSize) {
      return `File size ${file.size} exceeds maximum ${maxSize} bytes`;
    }

    return null;
  }, [acceptedTypes, maxSize]);

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    setUploadProgress(0);

    const progressCallback = (progress: number) => {
      setUploadProgress(progress);
      onProgress?.(progress);
    };

    try {
      const result = await asyncOp.execute(file, progressCallback);
      setUploadProgress(100);
      return result;
    } catch (error) {
      setUploadProgress(0);
      throw error;
    }
  }, [validateFile, onProgress, asyncOp]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  return {
    ...asyncOp,
    uploadFile,
    uploadProgress,
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    validateFile
  };
}

export default useAsyncOperation;