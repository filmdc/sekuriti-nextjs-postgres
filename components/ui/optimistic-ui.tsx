'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { toast } from '@/components/ui/toast';

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  isPending: boolean;
  error?: string;
}

interface UseOptimisticActionOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

// Hook for optimistic updates
function useOptimisticAction<T, P>(
  action: (params: P) => Promise<T>,
  initialData: T,
  options: UseOptimisticActionOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    isPending: false,
    error: undefined
  });

  const execute = (
    params: P,
    optimisticUpdate?: (current: T) => T
  ) => {
    // Apply optimistic update immediately
    if (optimisticUpdate) {
      setState(current => ({
        ...current,
        data: optimisticUpdate(current.data),
        isOptimistic: true,
        error: undefined
      }));
    }

    startTransition(async () => {
      setState(current => ({ ...current, isPending: true }));

      try {
        const result = await action(params);

        setState({
          data: result,
          isOptimistic: false,
          isPending: false,
          error: undefined
        });

        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        options.onSuccess?.(result);
      } catch (error) {
        // Revert optimistic update on error
        setState(current => ({
          data: initialData,
          isOptimistic: false,
          isPending: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        }));

        const errorMessage = options.errorMessage ||
          (error instanceof Error ? error.message : 'An error occurred');

        toast.error(errorMessage);
        options.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    });
  };

  return {
    state,
    execute,
    isPending: isPending || state.isPending,
    isOptimistic: state.isOptimistic,
    error: state.error
  };
}

// Optimistic list component for common list operations
interface OptimisticListProps<T> {
  items: T[];
  renderItem: (item: T, options: { isOptimistic: boolean; isPending: boolean }) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
}

function OptimisticList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  emptyState,
  loadingState
}: OptimisticListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, { isOptimistic: false, isPending: false })}
        </div>
      ))}
    </div>
  );
}

// Optimistic button for actions with immediate feedback
interface OptimisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onAction: () => Promise<void>;
  optimisticLabel?: string;
  successLabel?: string;
  errorLabel?: string;
  showStatus?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

function OptimisticButton({
  children,
  onAction,
  optimisticLabel,
  successLabel,
  errorLabel,
  showStatus = true,
  className,
  disabled,
  ...props
}: OptimisticButtonProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setStatus('pending');

    startTransition(async () => {
      try {
        await onAction();
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    });
  };

  const getLabel = () => {
    switch (status) {
      case 'pending':
        return optimisticLabel || 'Processing...';
      case 'success':
        return successLabel || 'Success!';
      case 'error':
        return errorLabel || 'Try again';
      default:
        return children;
    }
  };

  return (
    <div className="space-y-2">
      <button
        {...props}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        onClick={handleClick}
        disabled={disabled || isPending || status === 'pending'}
      >
        {getLabel()}
      </button>

      {showStatus && status !== 'idle' && (
        <StatusIndicator
          status={status === 'pending' ? 'loading' : status}
          variant="minimal"
          size="sm"
        />
      )}
    </div>
  );
}

// Optimistic form wrapper
interface OptimisticFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
}

function OptimisticForm({
  onSubmit,
  children,
  className,
  successMessage = 'Form submitted successfully',
  errorMessage = 'Failed to submit form',
  resetOnSuccess = false
}: OptimisticFormProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setStatus('pending');

    startTransition(async () => {
      try {
        await onSubmit(formData);
        setStatus('success');
        toast.success(successMessage);

        if (resetOnSuccess) {
          (event.target as HTMLFormElement).reset();
        }

        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        setStatus('error');
        toast.error(errorMessage);
        setTimeout(() => setStatus('idle'), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <fieldset disabled={isPending || status === 'pending'} className="space-y-4">
        {children}

        {status !== 'idle' && (
          <StatusIndicator
            status={status === 'pending' ? 'loading' : status}
            variant="minimal"
            size="sm"
          />
        )}
      </fieldset>
    </form>
  );
}

// Optimistic toggle component
interface OptimisticToggleProps {
  checked: boolean;
  onToggle: (checked: boolean) => Promise<void>;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function OptimisticToggle({
  checked,
  onToggle,
  label,
  disabled,
  className
}: OptimisticToggleProps) {
  const [optimisticChecked, setOptimisticChecked] = useState(checked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newValue = !optimisticChecked;

    // Optimistic update
    setOptimisticChecked(newValue);

    startTransition(async () => {
      try {
        await onToggle(newValue);
      } catch (error) {
        // Revert on error
        setOptimisticChecked(checked);
        toast.error('Failed to update setting');
      }
    });
  };

  return (
    <label className={cn('flex items-center space-x-2 cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={optimisticChecked}
        onChange={handleToggle}
        disabled={disabled || isPending}
        className="rounded border-input"
      />
      {label && (
        <span className={cn(
          'text-sm',
          isPending && 'opacity-50',
          disabled && 'text-muted-foreground'
        )}>
          {label}
        </span>
      )}
      {isPending && (
        <StatusIndicator status="loading" variant="minimal" size="sm" showMessage={false} />
      )}
    </label>
  );
}

export {
  useOptimisticAction,
  OptimisticList,
  OptimisticButton,
  OptimisticForm,
  OptimisticToggle,
  type OptimisticState
};