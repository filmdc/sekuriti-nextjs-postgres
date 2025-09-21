# User Feedback System

A comprehensive user feedback system that provides loading states, status indicators, progress tracking, confirmation dialogs, and optimistic UI updates to enhance user experience.

## Overview

The feedback system consists of several key components and hooks that work together to provide users with clear, immediate feedback about their actions and the application state.

## Components

### Core Feedback Components

#### 1. Loading States
- **LoadingSpinner**: Configurable spinner with different sizes and text
- **InlineSpinner**: Small spinner for inline use (buttons, etc.)
- **LoadingOverlay**: Overlay that covers content during loading
- **Skeleton Components**: Placeholder components for loading content

```tsx
import { LoadingSpinner, InlineSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList } from '@/components/ui/skeleton';

// Basic spinner
<LoadingSpinner size="default" text="Loading..." />

// Overlay loading
<LoadingOverlay isLoading={isLoading} text="Processing...">
  <YourContent />
</LoadingOverlay>

// Skeleton loaders
<SkeletonCard />
<SkeletonList items={5} />
<Skeleton variant="text" lines={3} />
```

#### 2. Status Indicators
- **StatusIndicator**: Versatile status component with multiple variants
- **FormStatus**: Specialized for form validation feedback
- **ConnectionStatus**: Online/offline status monitoring
- **StatusDot**: Compact status dots for space-constrained areas

```tsx
import { StatusIndicator, FormStatus, ConnectionStatus, StatusDot } from '@/components/ui/status-indicator';

// Basic status
<StatusIndicator status="success" message="Operation completed" />
<StatusIndicator status="error" message="Something went wrong" variant="minimal" />

// Form validation
<FormStatus status="invalid" message="Please check your input" />

// Connection monitoring
<ConnectionStatus isOnline={navigator.onLine} />

// Status dots
<StatusDot status="success" />
<StatusDot status="critical" pulse />
```

#### 3. Progress Indicators
- **ProgressIndicator**: Linear progress bars with labels
- **StepProgress**: Multi-step process visualization
- **CircularProgress**: Circular progress rings

```tsx
import { ProgressIndicator, StepProgress, CircularProgress } from '@/components/ui/progress-indicator';

// Linear progress
<ProgressIndicator value={progress} max={100} label="Upload Progress" />

// Step-based progress
<StepProgress
  currentStep={currentStep}
  totalSteps={4}
  steps={[
    { label: 'Initialize', description: 'Setting up...' },
    { label: 'Process', description: 'Working...' },
    { label: 'Validate', description: 'Checking...' },
    { label: 'Complete', description: 'Done!' }
  ]}
/>

// Circular progress
<CircularProgress value={75} size={120}>
  <div className="text-center">
    <div className="text-2xl font-bold">75%</div>
    <div className="text-xs">Complete</div>
  </div>
</CircularProgress>
```

#### 4. Confirmation Dialogs
- **ConfirmationDialog**: Generic confirmation dialog
- **DeleteConfirmationDialog**: Specialized for delete operations
- **ArchiveConfirmationDialog**: Specialized for archive operations
- **LogoutConfirmationDialog**: Specialized for logout actions

```tsx
import {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  ArchiveConfirmationDialog
} from '@/components/ui/confirmation-dialog';

// Generic confirmation
<ConfirmationDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  variant="destructive"
/>

// Delete confirmation
<DeleteConfirmationDialog
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  itemName="Important Document"
  isLoading={isDeleting}
/>
```

#### 5. Optimistic UI Components
- **OptimisticButton**: Button with immediate feedback
- **OptimisticForm**: Form with optimistic updates
- **OptimisticToggle**: Toggle with immediate visual feedback
- **OptimisticList**: List component supporting optimistic updates

```tsx
import { OptimisticButton, OptimisticForm, OptimisticToggle } from '@/components/ui/optimistic-ui';

// Optimistic button
<OptimisticButton
  onAction={async () => {
    await updateSettings();
  }}
  successMessage="Settings saved!"
  errorMessage="Failed to save settings"
>
  Save Settings
</OptimisticButton>

// Optimistic toggle
<OptimisticToggle
  checked={enabled}
  onToggle={async (checked) => {
    await updateFeature(checked);
  }}
  label="Enable notifications"
/>

// Optimistic form
<OptimisticForm
  onSubmit={async (formData) => {
    await submitForm(formData);
  }}
  successMessage="Form submitted!"
>
  <Input name="email" placeholder="Email" />
  <EnhancedSubmitButton>Submit</EnhancedSubmitButton>
</OptimisticForm>
```

#### 6. Enhanced Buttons
- **EnhancedSubmitButton**: Submit button with comprehensive feedback
- **ActionButton**: Button for async actions with status feedback
- **SimpleSubmitButton**: Basic submit button with loading state

```tsx
import { EnhancedSubmitButton, ActionButton } from '@/components/ui/enhanced-submit-button';

// Enhanced submit with form feedback
<EnhancedSubmitButton
  formId="contact-form"
  pendingText="Sending..."
  successText="Message sent!"
  errorText="Failed to send"
>
  Send Message
</EnhancedSubmitButton>

// Action button with confirmation
<ActionButton
  action={async () => {
    await deleteItem(itemId);
  }}
  confirmRequired
  confirmMessage="This cannot be undone. Continue?"
  variant="destructive"
  successMessage="Item deleted"
  errorMessage="Failed to delete"
>
  Delete Item
</ActionButton>
```

### Provider System

#### FeedbackProvider
The central provider that manages global feedback state and provides context for all feedback components.

```tsx
import { FeedbackProvider } from '@/components/feedback/feedback-provider';

// Wrap your app
<FeedbackProvider>
  <YourApp />
</FeedbackProvider>
```

## Hooks

### Core Hooks

#### useFeedback
Main hook providing access to all feedback functionality.

```tsx
import { useFeedback } from '@/components/feedback/feedback-provider';

const {
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
} = useFeedback();
```

#### useToast
Simplified hook for toast notifications.

```tsx
import { useToast } from '@/components/feedback/feedback-provider';

const { showSuccess, showError, showInfo, showWarning } = useToast();

showSuccess('Operation completed!');
showError('Something went wrong');
```

#### useLoading
Hook for managing loading states with keys.

```tsx
import { useLoading } from '@/components/feedback/feedback-provider';

const { setLoading, isLoading, isAnyLoading } = useLoading();

// Set loading state
setLoading('user-update', true);

// Check loading state
if (isLoading('user-update')) {
  // Show loading UI
}
```

#### useFormFeedback
Hook for managing form-specific feedback.

```tsx
import { useFormFeedback } from '@/components/feedback/feedback-provider';

const formFeedback = useFormFeedback('contact-form');

// Set form states
formFeedback.setSubmitting('Validating...');
formFeedback.setSuccess('Form submitted successfully!');
formFeedback.setError('Validation failed', {
  email: 'Invalid email format',
  password: 'Password too short'
});

// Check form status
if (formFeedback.isSubmitting) {
  // Show submitting state
}
```

### Advanced Hooks

#### useAsyncOperation
Comprehensive hook for handling async operations with automatic feedback.

```tsx
import { useAsyncOperation } from '@/hooks/use-async-operation';

const {
  isLoading,
  error,
  data,
  isSuccess,
  isError,
  execute,
  reset
} = useAsyncOperation(
  async (userId: string) => {
    return await fetchUser(userId);
  },
  {
    successMessage: 'User loaded successfully',
    errorMessage: 'Failed to load user',
    loadingKey: 'user-fetch'
  }
);

// Execute the operation
await execute('user-123');
```

#### useMutation
Specialized hook for mutations (create, update, delete operations).

```tsx
import { useMutation } from '@/hooks/use-async-operation';

const {
  mutate,
  isPending,
  isSuccess,
  isError,
  error,
  reset
} = useMutation(
  async (userData: User) => {
    return await updateUser(userData);
  },
  {
    successMessage: 'User updated successfully',
    errorMessage: 'Failed to update user'
  }
);

// Perform mutation
await mutate({ id: '123', name: 'John Doe' });
```

#### useFileUpload
Hook for file uploads with progress tracking.

```tsx
import { useFileUpload } from '@/hooks/use-async-operation';

const {
  uploadFile,
  uploadProgress,
  isLoading,
  isDragOver,
  handleDrop,
  handleDragOver,
  handleDragLeave
} = useFileUpload(
  async (file: File, progressCallback) => {
    return await uploadToServer(file, progressCallback);
  },
  {
    acceptedTypes: ['image/*', '.pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    onProgress: (progress) => console.log(`Upload: ${progress}%`),
    successMessage: 'File uploaded successfully'
  }
);
```

## Error Handling

### Error Boundary
Comprehensive error boundary system for catching and displaying errors gracefully.

```tsx
import { ErrorBoundary, withErrorBoundary } from '@/components/feedback/error-boundary';

// Wrap components
<ErrorBoundary
  fallback={CustomErrorFallback}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(YourComponent, {
  onError: (error) => console.error(error)
});
```

### useAsyncError
Hook for handling async errors in components.

```tsx
import { useAsyncError } from '@/components/feedback/error-boundary';

const throwAsyncError = useAsyncError();

try {
  await riskyAsyncOperation();
} catch (error) {
  throwAsyncError(error); // Will be caught by error boundary
}
```

## Best Practices

### 1. Loading States
- Always provide loading feedback for operations > 200ms
- Use skeleton loaders for predictable content structure
- Provide meaningful loading messages
- Use appropriate loading indicators for the context

### 2. Error Handling
- Provide actionable error messages
- Include recovery actions when possible
- Use appropriate error severity levels
- Log errors for debugging but show user-friendly messages

### 3. Progress Indication
- Show progress for operations > 2 seconds
- Use step indicators for multi-step processes
- Provide time estimates when possible
- Allow cancellation of long operations

### 4. Confirmations
- Always confirm destructive actions
- Provide clear descriptions of consequences
- Use appropriate confirmation variants
- Include loading states in confirmation dialogs

### 5. Optimistic Updates
- Use optimistic updates for quick operations
- Always provide rollback capability
- Show clear indicators for optimistic state
- Handle network failures gracefully

### 6. Toast Notifications
- Keep messages concise and actionable
- Use appropriate types (success, error, warning, info)
- Don't overwhelm users with too many toasts
- Provide actions in toasts when relevant

## Examples

### Complete Form Example

```tsx
'use client';

import { useState } from 'react';
import { useFormFeedback } from '@/components/feedback/feedback-provider';
import { EnhancedSubmitButton } from '@/components/ui/enhanced-submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContactForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const formFeedback = useFormFeedback('contact-form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    formFeedback.setSubmitting('Sending message...');

    try {
      // Validation
      if (!email.includes('@')) {
        formFeedback.setError('Please enter a valid email', {
          email: 'Invalid email format'
        });
        return;
      }

      // Submit
      await submitContactForm({ email, message });

      formFeedback.setSuccess('Message sent successfully!');
      setEmail('');
      setMessage('');

    } catch (error) {
      formFeedback.setError('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formFeedback.isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={formFeedback.isSubmitting}
          className="w-full p-2 border rounded"
        />
      </div>

      <EnhancedSubmitButton
        formId="contact-form"
        pendingText="Sending..."
        successText="Sent!"
        className="w-full"
      >
        Send Message
      </EnhancedSubmitButton>
    </form>
  );
}
```

### Data Loading Example

```tsx
'use client';

import { useEffect } from 'react';
import { useAsyncOperation } from '@/hooks/use-async-operation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { SkeletonList } from '@/components/ui/skeleton';

export function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    execute: fetchUsers,
    reset
  } = useAsyncOperation(
    async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    {
      successMessage: 'Users loaded successfully',
      errorMessage: 'Failed to load users',
      loadingKey: 'users-fetch'
    }
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return <SkeletonList items={5} />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <StatusIndicator
          status="error"
          message={error?.message || 'Failed to load users'}
        />
        <button
          onClick={() => {
            reset();
            fetchUsers();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users?.map((user: any) => (
        <div key={user.id} className="p-4 border rounded">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

This feedback system provides a complete solution for user experience enhancement, ensuring users always know what's happening and receive appropriate feedback for their actions.