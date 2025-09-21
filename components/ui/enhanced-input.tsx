'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  isLoading?: boolean;
  showValidation?: boolean;
  onValidate?: (value: string) => Promise<string | null> | string | null;
  validationDelay?: number;
  showPasswordToggle?: boolean;
  autoSave?: boolean;
  onAutoSave?: (value: string) => void;
  autoSaveDelay?: number;
  formatExample?: string;
  containerClassName?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    type,
    label,
    error,
    success,
    helperText,
    isLoading,
    showValidation = true,
    onValidate,
    validationDelay = 500,
    showPasswordToggle = false,
    autoSave = false,
    onAutoSave,
    autoSaveDelay = 1000,
    formatExample,
    containerClassName,
    disabled,
    ...props
  }, ref) => {
    const [internalType, setInternalType] = React.useState(type);
    const [showPassword, setShowPassword] = React.useState(false);
    const [validationState, setValidationState] = React.useState<{
      isValidating: boolean;
      error: string | null;
      success: string | null;
    }>({
      isValidating: false,
      error: null,
      success: null,
    });

    const [autoSaveState, setAutoSaveState] = React.useState<{
      isSaving: boolean;
      lastSaved: Date | null;
    }>({
      isSaving: false,
      lastSaved: null,
    });

    const validationTimeoutRef = React.useRef<NodeJS.Timeout>();
    const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Handle password visibility toggle
    React.useEffect(() => {
      if (showPasswordToggle && type === 'password') {
        setInternalType(showPassword ? 'text' : 'password');
      }
    }, [showPassword, showPasswordToggle, type]);

    // Validation logic
    const validateInput = React.useCallback(async (value: string) => {
      if (!onValidate || !showValidation) return;

      setValidationState(prev => ({ ...prev, isValidating: true }));

      try {
        const result = await onValidate(value);
        setValidationState({
          isValidating: false,
          error: result,
          success: result ? null : 'Looks good!',
        });
      } catch (err) {
        setValidationState({
          isValidating: false,
          error: 'Validation failed',
          success: null,
        });
      }
    }, [onValidate, showValidation]);

    // Auto-save logic
    const triggerAutoSave = React.useCallback(async (value: string) => {
      if (!autoSave || !onAutoSave) return;

      setAutoSaveState(prev => ({ ...prev, isSaving: true }));

      try {
        await onAutoSave(value);
        setAutoSaveState({
          isSaving: false,
          lastSaved: new Date(),
        });
      } catch (err) {
        setAutoSaveState(prev => ({ ...prev, isSaving: false }));
      }
    }, [autoSave, onAutoSave]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      props.onChange?.(e);

      // Clear previous timeouts
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Reset validation state
      setValidationState(prev => ({ ...prev, error: null, success: null }));

      // Trigger validation after delay
      if (onValidate && showValidation && value) {
        validationTimeoutRef.current = setTimeout(() => {
          validateInput(value);
        }, validationDelay);
      }

      // Trigger auto-save after delay
      if (autoSave && onAutoSave && value) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          triggerAutoSave(value);
        }, autoSaveDelay);
      }
    };

    // Clean up timeouts
    React.useEffect(() => {
      return () => {
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }, []);

    // Determine current error and success states
    const currentError = error || validationState.error;
    const currentSuccess = success || validationState.success;
    const showSuccess = currentSuccess && !currentError && !validationState.isValidating;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            type={internalType}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              currentError && "border-destructive focus-visible:ring-destructive",
              showSuccess && "border-green-500 focus-visible:ring-green-500",
              validationState.isValidating && "border-yellow-500",
              showPasswordToggle && "pr-10",
              (isLoading || validationState.isValidating || autoSaveState.isSaving) && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
            onChange={handleChange}
          />

          {/* Right side icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {/* Loading spinner */}
            {(isLoading || validationState.isValidating || autoSaveState.isSaving) && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {/* Validation icons */}
            {!isLoading && !validationState.isValidating && !autoSaveState.isSaving && (
              <>
                {currentError && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {showSuccess && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </>
            )}

            {/* Password toggle */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper text, error, success, and format example */}
        <div className="space-y-1">
          {formatExample && !currentError && !currentSuccess && (
            <p className="text-xs text-muted-foreground">
              Format: {formatExample}
            </p>
          )}

          {currentError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {currentError}
            </p>
          )}

          {showSuccess && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {currentSuccess}
            </p>
          )}

          {helperText && !currentError && !showSuccess && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}

          {/* Auto-save indicator */}
          {autoSave && autoSaveState.lastSaved && (
            <p className="text-xs text-muted-foreground">
              Last saved: {autoSaveState.lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };