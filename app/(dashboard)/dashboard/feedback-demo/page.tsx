'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Feedback components
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList } from '@/components/ui/skeleton';
import { LoadingSpinner, InlineSpinner, LoadingOverlay } from '@/components/ui/loading-spinner';
import {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  ArchiveConfirmationDialog
} from '@/components/ui/confirmation-dialog';
import {
  ProgressIndicator,
  StepProgress,
  CircularProgress
} from '@/components/ui/progress-indicator';
import {
  StatusIndicator,
  FormStatus,
  ConnectionStatus,
  StatusDot
} from '@/components/ui/status-indicator';
import {
  OptimisticButton,
  OptimisticForm,
  OptimisticToggle,
  useOptimisticAction
} from '@/components/ui/optimistic-ui';
import { EnhancedSubmitButton, ActionButton } from '@/components/ui/enhanced-submit-button';
import {
  useFeedback,
  useToast,
  useLoading,
  useFormFeedback,
  useConnectionStatus
} from '@/components/feedback/feedback-provider';

export default function FeedbackDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState(false);

  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const { setLoading, isLoading } = useLoading();
  const isOnline = useConnectionStatus();
  const formFeedback = useFormFeedback('demo-form');

  // Simulate async operations
  const simulateOperation = async (duration = 2000) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const simulateStepProgress = () => {
    setCurrentStep(1);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const steps = [
    { label: 'Initialize', description: 'Setting up the process' },
    { label: 'Validate', description: 'Checking requirements' },
    { label: 'Process', description: 'Executing main operation' },
    { label: 'Complete', description: 'Finalizing results' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Feedback System Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive demonstration of all feedback components and patterns.
        </p>
      </div>

      <Tabs defaultValue="loading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="optimistic">Optimistic</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        {/* Loading States */}
        <TabsContent value="loading" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading Spinners</CardTitle>
                <CardDescription>Different loading spinner variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sizes</p>
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="default" />
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">With Text</p>
                  <LoadingSpinner text="Loading data..." />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Inline Spinner</p>
                  <div className="flex items-center space-x-2">
                    <InlineSpinner />
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
                <CardDescription>Skeleton loaders for content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Text Skeleton</p>
                  <Skeleton variant="text" lines={3} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Button Skeleton</p>
                  <Skeleton variant="button" className="w-32" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Circular Skeleton</p>
                  <Skeleton variant="circular" className="h-12 w-12" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading Overlay</CardTitle>
                <CardDescription>Overlay loading states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setShowOverlay(!showOverlay)}>
                  Toggle Overlay
                </Button>
                <LoadingOverlay isLoading={showOverlay} text="Processing request...">
                  <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Content behind overlay</p>
                  </div>
                </LoadingOverlay>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Complex Skeleton Examples</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Card Skeleton</p>
                <SkeletonCard />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">List Skeleton</p>
                <SkeletonList items={3} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Table Skeleton</p>
              <SkeletonTable rows={4} columns={3} />
            </div>
          </div>
        </TabsContent>

        {/* Status Indicators */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
                <CardDescription>Different status types and variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusIndicator status="success" message="Operation completed successfully" />
                <StatusIndicator status="error" message="Something went wrong" />
                <StatusIndicator status="warning" message="Please review your input" />
                <StatusIndicator status="info" message="Additional information available" />
                <StatusIndicator status="loading" message="Processing your request..." />
                <StatusIndicator status="pending" message="Waiting for approval" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Variants</CardTitle>
                <CardDescription>Minimal and badge variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Minimal Variant</p>
                  <StatusIndicator status="success" message="Success" variant="minimal" />
                  <StatusIndicator status="error" message="Error" variant="minimal" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Badge Variant</p>
                  <div className="flex space-x-2">
                    <StatusIndicator status="online" variant="badge" />
                    <StatusIndicator status="offline" variant="badge" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status Dots</p>
                  <div className="flex space-x-2 items-center">
                    <StatusDot status="success" />
                    <StatusDot status="warning" />
                    <StatusDot status="error" />
                    <StatusDot status="loading" pulse />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Online/offline status monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectionStatus isOnline={isOnline} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Indicators */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Indicators</CardTitle>
                <CardDescription>Linear progress with different styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button onClick={simulateProgress} size="sm">
                    Simulate Progress
                  </Button>
                  <ProgressIndicator
                    value={progress}
                    label="Download Progress"
                    variant="default"
                  />
                  <ProgressIndicator
                    value={progress}
                    label="Upload Progress"
                    variant="success"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Circular Progress</CardTitle>
                <CardDescription>Circular progress indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <CircularProgress value={progress} size={120}>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{progress}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </CircularProgress>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Step Progress</CardTitle>
              <CardDescription>Multi-step process indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={simulateStepProgress} size="sm">
                Simulate Steps
              </Button>
              <StepProgress
                currentStep={currentStep}
                totalSteps={4}
                steps={steps}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confirmation Dialogs */}
        <TabsContent value="dialogs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Confirmation Dialogs</CardTitle>
                <CardDescription>Different confirmation types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => setConfirmDialog(true)} size="sm">
                  Basic Confirmation
                </Button>
                <Button onClick={() => setDeleteDialog(true)} variant="destructive" size="sm">
                  Delete Confirmation
                </Button>
                <Button onClick={() => setArchiveDialog(true)} variant="outline" size="sm">
                  Archive Confirmation
                </Button>
              </CardContent>
            </Card>
          </div>

          <ConfirmationDialog
            isOpen={confirmDialog}
            onClose={() => setConfirmDialog(false)}
            onConfirm={async () => {
              await simulateOperation(1000);
              setConfirmDialog(false);
              showSuccess('Operation completed!');
            }}
            title="Confirm Action"
            description="Are you sure you want to proceed with this action?"
          />

          <DeleteConfirmationDialog
            isOpen={deleteDialog}
            onClose={() => setDeleteDialog(false)}
            onConfirm={async () => {
              await simulateOperation(1000);
              setDeleteDialog(false);
              showSuccess('Item deleted successfully');
            }}
            itemName="Important Document"
          />

          <ArchiveConfirmationDialog
            isOpen={archiveDialog}
            onClose={() => setArchiveDialog(false)}
            onConfirm={async () => {
              await simulateOperation(1000);
              setArchiveDialog(false);
              showSuccess('Item archived successfully');
            }}
            itemName="Project Files"
          />
        </TabsContent>

        {/* Optimistic UI */}
        <TabsContent value="optimistic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimistic Actions</CardTitle>
                <CardDescription>Immediate feedback with rollback on error</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <OptimisticButton
                  onAction={async () => {
                    await simulateOperation(1000);
                    if (Math.random() > 0.7) throw new Error('Random failure');
                  }}
                  successMessage="Action completed!"
                  errorMessage="Action failed, please try again"
                >
                  Optimistic Action
                </OptimisticButton>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Optimistic Toggle</p>
                  <OptimisticToggle
                    checked={optimisticValue}
                    onToggle={async (checked) => {
                      await simulateOperation(800);
                      setOptimisticValue(checked);
                    }}
                    label="Enable notifications"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Buttons</CardTitle>
                <CardDescription>Enhanced buttons with status feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ActionButton
                  action={async () => {
                    await simulateOperation(1500);
                    showSuccess('Data exported successfully!');
                  }}
                  variant="outline"
                >
                  Export Data
                </ActionButton>

                <ActionButton
                  action={async () => {
                    await simulateOperation(1000);
                    if (Math.random() > 0.6) throw new Error('Network error');
                    showSuccess('Settings saved!');
                  }}
                  confirmRequired
                  confirmMessage="This will reset all your preferences. Continue?"
                  variant="destructive"
                >
                  Reset Settings
                </ActionButton>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forms */}
        <TabsContent value="forms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Form</CardTitle>
                <CardDescription>Form with comprehensive feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <OptimisticForm
                  onSubmit={async (formData) => {
                    formFeedback.setSubmitting('Validating data...');
                    await simulateOperation(1000);

                    const email = formData.get('email') as string;
                    if (!email.includes('@')) {
                      throw new Error('Invalid email address');
                    }

                    formFeedback.setSuccess('Form submitted successfully!');
                  }}
                  successMessage="Form submitted!"
                  errorMessage="Submission failed"
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="demo-email">Email</Label>
                    <Input
                      id="demo-email"
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo-message">Message</Label>
                    <Input
                      id="demo-message"
                      name="message"
                      placeholder="Enter message"
                      required
                    />
                  </div>
                  <EnhancedSubmitButton
                    formId="demo-form"
                    className="w-full"
                    successText="Submitted!"
                  >
                    Submit Form
                  </EnhancedSubmitButton>
                </OptimisticForm>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
                <CardDescription>Different toast notification types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => showSuccess('Success notification!')}
                  variant="success"
                  size="sm"
                >
                  Success Toast
                </Button>
                <Button
                  onClick={() => showError('Error notification!')}
                  variant="destructive"
                  size="sm"
                >
                  Error Toast
                </Button>
                <Button
                  onClick={() => showWarning('Warning notification!')}
                  variant="warning"
                  size="sm"
                >
                  Warning Toast
                </Button>
                <Button
                  onClick={() => showInfo('Info notification!')}
                  variant="outline"
                  size="sm"
                >
                  Info Toast
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}