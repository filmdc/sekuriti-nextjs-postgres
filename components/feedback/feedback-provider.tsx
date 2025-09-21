'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from '@/components/ui/toast';
import { ErrorBoundary } from './error-boundary';

interface FeedbackContextType {
  // Toast notifications
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;

  // Loading states
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;

  // Form feedback
  setFormStatus: (formId: string, status: FormStatus) => void;
  getFormStatus: (formId: string) => FormStatus;

  // Global state
  isOnline: boolean;
}

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FormStatus {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

interface FeedbackProviderProps {
  children: React.ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());
  const [formStatuses, setFormStatuses] = useState<Map<string, FormStatus>>(new Map());
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast notification methods
  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message);
    // TODO: Handle options like duration and actions when implementing custom toast
  }, []);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message);
  }, []);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    toast.info(message);
  }, []);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    toast.warning(message);
  }, []);

  // Loading state management
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      if (loading) {
        newMap.set(key, true);
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key) === true;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return loadingStates.size > 0;
  }, [loadingStates]);

  // Form status management
  const setFormStatus = useCallback((formId: string, status: FormStatus) => {
    setFormStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(formId, status);
      return newMap;
    });

    // Auto-clear success/error status after delay
    if (status.status === 'success' || status.status === 'error') {
      setTimeout(() => {
        setFormStatuses(prev => {
          const newMap = new Map(prev);
          const currentStatus = newMap.get(formId);
          if (currentStatus?.status === status.status) {
            newMap.set(formId, { status: 'idle' });
          }
          return newMap;
        });
      }, 5000);
    }
  }, []);

  const getFormStatus = useCallback((formId: string) => {
    return formStatuses.get(formId) || { status: 'idle' };
  }, [formStatuses]);

  const value: FeedbackContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    setLoading,
    isLoading,
    isAnyLoading,
    setFormStatus,
    getFormStatus,
    isOnline
  };

  return (
    <FeedbackContext.Provider value={value}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

// Convenience hooks for specific feedback types
export function useToast() {
  const { showSuccess, showError, showInfo, showWarning } = useFeedback();
  return { showSuccess, showError, showInfo, showWarning };
}

export function useLoading() {
  const { setLoading, isLoading, isAnyLoading } = useFeedback();
  return { setLoading, isLoading, isAnyLoading };
}

export function useFormFeedback(formId: string) {
  const { setFormStatus, getFormStatus } = useFeedback();

  const setStatus = useCallback((status: FormStatus) => {
    setFormStatus(formId, status);
  }, [formId, setFormStatus]);

  const status = getFormStatus(formId);

  const setSubmitting = useCallback((message?: string) => {
    setStatus({ status: 'submitting', message });
  }, [setStatus]);

  const setSuccess = useCallback((message?: string) => {
    setStatus({ status: 'success', message });
  }, [setStatus]);

  const setError = useCallback((message?: string, errors?: Record<string, string>) => {
    setStatus({ status: 'error', message, errors });
  }, [setStatus]);

  const setIdle = useCallback(() => {
    setStatus({ status: 'idle' });
  }, [setStatus]);

  return {
    status,
    setSubmitting,
    setSuccess,
    setError,
    setIdle,
    isSubmitting: status.status === 'submitting',
    isSuccess: status.status === 'success',
    isError: status.status === 'error',
    isIdle: status.status === 'idle'
  };
}

// Connection status hook
export function useConnectionStatus() {
  const { isOnline } = useFeedback();
  return isOnline;
}