// Export all feedback components for easy importing
export {
  FeedbackProvider,
  useFeedback,
  useToast,
  useLoading,
  useFormFeedback,
  useConnectionStatus
} from './feedback-provider';

export {
  ErrorBoundary,
  DefaultErrorFallback,
  MinimalErrorFallback,
  AsyncErrorBoundary,
  useAsyncError,
  withErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryFallbackProps
} from './error-boundary';

// Re-export UI components for convenience
export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList
} from '../ui/skeleton';

export {
  LoadingSpinner,
  InlineSpinner,
  LoadingOverlay
} from '../ui/loading-spinner';

export {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  ArchiveConfirmationDialog,
  LogoutConfirmationDialog
} from '../ui/confirmation-dialog';

export {
  ProgressIndicator,
  StepProgress,
  CircularProgress
} from '../ui/progress-indicator';

export {
  StatusIndicator,
  FormStatus,
  ConnectionStatus,
  StatusDot,
  type StatusType
} from '../ui/status-indicator';

export {
  useOptimisticAction,
  OptimisticList,
  OptimisticButton,
  OptimisticForm,
  OptimisticToggle,
  type OptimisticState
} from '../ui/optimistic-ui';

export {
  EnhancedSubmitButton,
  SimpleSubmitButton,
  ActionButton
} from '../ui/enhanced-submit-button';