'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { InlineSpinner } from '@/components/ui/loading-spinner';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { useFormFeedback } from '@/components/feedback/feedback-provider';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EnhancedSubmitButtonProps extends Omit<ButtonProps, 'loading'> {
  formId?: string;
  pendingText?: string;
  successText?: string;
  errorText?: string;
  showStatusIndicator?: boolean;
  resetStatusDelay?: number;
}

export function EnhancedSubmitButton({
  children,
  formId,
  pendingText = 'Submitting...',
  successText = 'Success!',
  errorText = 'Try Again',
  showStatusIndicator = true,
  resetStatusDelay = 3000,
  className,
  variant = 'default',
  disabled,
  ...props
}: EnhancedSubmitButtonProps) {
  const { pending } = useFormStatus();
  const formFeedback = formId ? useFormFeedback(formId) : null;

  // Determine button state
  const isLoading = pending || formFeedback?.isSubmitting;
  const isSuccess = formFeedback?.isSuccess;
  const isError = formFeedback?.isError;

  // Get appropriate text and variant
  const getButtonContent = () => {
    if (isLoading) return pendingText;
    if (isSuccess) return successText;
    if (isError) return errorText;
    return children;
  };

  const getButtonVariant = (): ButtonProps['variant'] => {
    if (isSuccess) return 'success';
    if (isError) return 'outline-danger';
    return variant;
  };

  const getButtonIcon = () => {
    if (isLoading) return <InlineSpinner className="mr-2" />;
    if (isSuccess) return <CheckCircle className="h-4 w-4 mr-2" />;
    if (isError) return <AlertCircle className="h-4 w-4 mr-2" />;
    return null;
  };

  return (
    <div className="space-y-2">
      <Button
        type="submit"
        disabled={disabled || isLoading}
        variant={getButtonVariant()}
        className={cn(
          'transition-all duration-200',
          isSuccess && 'bg-green-600 hover:bg-green-700',
          className
        )}
        {...props}
      >
        {getButtonIcon()}
        {getButtonContent()}
      </Button>

      {/* Status indicator */}
      {showStatusIndicator && formFeedback && (
        <div className="min-h-[20px]">
          {formFeedback.status.message && (
            <StatusIndicator
              status={
                isLoading ? 'loading' :
                isSuccess ? 'success' :
                isError ? 'error' : 'idle'
              }
              message={formFeedback.status.message}
              variant="minimal"
              size="sm"
            />
          )}

          {/* Field errors */}
          {formFeedback.status.errors && (
            <div className="mt-2 space-y-1">
              {Object.entries(formFeedback.status.errors).map(([field, error]) => (
                <StatusIndicator
                  key={field}
                  status="error"
                  message={`${field}: ${error}`}
                  variant="minimal"
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified submit button for basic forms
export function SimpleSubmitButton({
  children = 'Submit',
  pendingText = 'Submitting...',
  ...props
}: Omit<EnhancedSubmitButtonProps, 'formId' | 'showStatusIndicator'>) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      loading={pending}
      disabled={pending}
      {...props}
    >
      {children}
    </Button>
  );
}

// Action button with optimistic feedback
interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'loading'> {
  action: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
  confirmRequired?: boolean;
  confirmMessage?: string;
}

export function ActionButton({
  children,
  action,
  successMessage,
  errorMessage,
  confirmRequired = false,
  confirmMessage = 'Are you sure?',
  disabled,
  ...props
}: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    if (confirmRequired && !window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      await action();
      setStatus('success');
      if (successMessage) {
        // toast.success(successMessage); // Will be handled by feedback provider
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      if (errorMessage) {
        // toast.error(errorMessage); // Will be handled by feedback provider
      }
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariant = (): ButtonProps['variant'] => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'outline-danger';
    return props.variant || 'default';
  };

  return (
    <Button
      {...props}
      variant={getVariant()}
      loading={isLoading}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {status === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
      {status === 'error' && <AlertCircle className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}

export default EnhancedSubmitButton;