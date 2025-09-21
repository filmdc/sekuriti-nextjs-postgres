'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

function ProgressIndicator({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'default',
  className
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100);

  const variantClasses = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  const sizeClasses = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="text-muted-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className={cn('font-medium', variantClasses[variant])}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <Progress
        value={percentage}
        className={cn(sizeClasses[size])}
        aria-label={label}
      />
    </div>
  );
}

// Step-based progress indicator
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps?: Array<{ label: string; description?: string }>;
  variant?: 'default' | 'compact';
  className?: string;
}

function StepProgress({
  currentStep,
  totalSteps,
  steps,
  variant = 'default',
  className
}: StepProgressProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <Progress
          value={(currentStep / totalSteps) * 100}
          className="flex-1 h-2"
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>

      {steps && (
        <div className="space-y-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 p-2 rounded-lg transition-colors',
                  isCurrent && 'bg-primary/5 border border-primary/20',
                  isCompleted && 'bg-green-50 dark:bg-green-950/20'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                  isCompleted && 'bg-green-600 text-white',
                  isCurrent && 'bg-primary text-primary-foreground',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="flex-1">
                  <div className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-green-700 dark:text-green-400',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <Clock className="w-4 h-4 text-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <Progress
        value={(currentStep / totalSteps) * 100}
        className="h-2"
      />
    </div>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  children
}: CircularProgressProps) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-label={`Progress: ${Math.round(percentage)}%`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-in-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export { ProgressIndicator, StepProgress, CircularProgress };