'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetError();
      } else if (resetKeys) {
        const prevResetKeys = prevProps.resetKeys || [];
        if (resetKeys.some((key, index) => key !== prevResetKeys[index])) {
          this.resetError();
        }
      }
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }, 0);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return <Fallback error={error} resetError={this.resetError} errorInfo={errorInfo} />;
      }

      return <DefaultErrorFallback error={error} resetError={this.resetError} errorInfo={errorInfo} />;
    }

    return children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>

        {isDev && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Details (Development)</h4>
            <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="default"
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// Minimal error fallback for smaller components
function MinimalErrorFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex items-center justify-center p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
      <div className="text-center space-y-2">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
        <p className="text-sm text-red-700 dark:text-red-300">Something went wrong</p>
        <Button onClick={resetError} variant="outline" size="sm">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Async error boundary for handling promise rejections
function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You might want to report this to an error tracking service
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

// Hook for handling async errors in components
function useAsyncError() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// Component wrapper for easier usage
interface WithErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export {
  ErrorBoundary,
  DefaultErrorFallback,
  MinimalErrorFallback,
  AsyncErrorBoundary,
  useAsyncError,
  withErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryFallbackProps
};