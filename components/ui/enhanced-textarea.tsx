'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  isLoading?: boolean;
  showValidation?: boolean;
  onValidate?: (value: string) => Promise<string | null> | string | null;
  validationDelay?: number;
  autoSave?: boolean;
  onAutoSave?: (value: string) => void;
  autoSaveDelay?: number;
  containerClassName?: string;
  showCharacterCount?: boolean;
  minCharacters?: number;
  maxCharacters?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    isLoading,
    showValidation = true,
    onValidate,
    validationDelay = 500,
    autoSave = false,
    onAutoSave,
    autoSaveDelay = 1000,
    containerClassName,
    showCharacterCount = false,
    minCharacters,
    maxCharacters,
    autoResize = false,
    minRows = 3,
    maxRows = 10,
    disabled,
    value,
    defaultValue,
    rows,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(
      (value || defaultValue || '') as string
    );

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

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const validationTimeoutRef = React.useRef<NodeJS.Timeout>();
    const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Update internal value when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value as string);
      }
    }, [value]);

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      const scrollHeight = Math.max(textarea.scrollHeight, minHeight);
      const finalHeight = Math.min(scrollHeight, maxHeight);

      textarea.style.height = `${finalHeight}px`;
    }, [autoResize, minRows, maxRows]);

    // Adjust height when content changes
    React.useEffect(() => {
      adjustHeight();
    }, [internalValue, adjustHeight]);

    // Validation logic
    const validateInput = React.useCallback(async (inputValue: string) => {
      if (!onValidate || !showValidation) return;

      setValidationState(prev => ({ ...prev, isValidating: true }));

      try {
        const result = await onValidate(inputValue);
        setValidationState({
          isValidating: false,
          error: result,
          success: result ? null : 'Content looks good!',
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
    const triggerAutoSave = React.useCallback(async (inputValue: string) => {
      if (!autoSave || !onAutoSave) return;

      setAutoSaveState(prev => ({ ...prev, isSaving: true }));

      try {
        await onAutoSave(inputValue);
        setAutoSaveState({
          isSaving: false,
          lastSaved: new Date(),
        });
      } catch (err) {
        setAutoSaveState(prev => ({ ...prev, isSaving: false }));
      }
    }, [autoSave, onAutoSave]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
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
      if (onValidate && showValidation && newValue) {
        validationTimeoutRef.current = setTimeout(() => {
          validateInput(newValue);
        }, validationDelay);
      }

      // Trigger auto-save after delay
      if (autoSave && onAutoSave && newValue) {
        autoSaveTimeoutRef.current = setTimeout(() => {
          triggerAutoSave(newValue);
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

    // Combine refs
    const combinedRef = React.useCallback((node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // Determine current error and success states
    const currentError = error || validationState.error;
    const currentSuccess = success || validationState.success;
    const showSuccess = currentSuccess && !currentError && !validationState.isValidating;

    // Character count logic
    const characterCount = internalValue.length;
    const isOverLimit = maxCharacters && characterCount > maxCharacters;
    const isUnderMinimum = minCharacters && characterCount < minCharacters;

    // Determine character count color
    const getCharacterCountColor = () => {
      if (isOverLimit) return "text-destructive";
      if (maxCharacters && characterCount > maxCharacters * 0.9) return "text-yellow-600";
      if (isUnderMinimum) return "text-muted-foreground";
      return "text-muted-foreground";
    };

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={props.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>

            {/* Status indicators */}
            <div className="flex items-center space-x-2 text-xs">
              {autoSaveState.isSaving && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}

              {autoSave && autoSaveState.lastSaved && !autoSaveState.isSaving && (
                <span className="flex items-center gap-1 text-green-600">
                  <Save className="h-3 w-3" />
                  Saved
                </span>
              )}

              {validationState.isValidating && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking...
                </span>
              )}
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              currentError && "border-destructive focus-visible:ring-destructive",
              showSuccess && "border-green-500 focus-visible:ring-green-500",
              validationState.isValidating && "border-yellow-500",
              autoResize && "resize-none",
              className
            )}
            ref={combinedRef}
            disabled={disabled || isLoading}
            value={value !== undefined ? value : internalValue}
            rows={autoResize ? minRows : rows}
            {...props}
            onChange={handleChange}
          />
        </div>

        {/* Bottom section with helper text, errors, character count */}
        <div className="space-y-1">
          {/* Character count */}
          {showCharacterCount && (
            <div className="flex justify-between items-center text-xs">
              <div>
                {minCharacters && isUnderMinimum && (
                  <span className="text-muted-foreground">
                    Minimum {minCharacters} characters required
                  </span>
                )}
              </div>
              <span className={getCharacterCountColor()}>
                {characterCount}
                {maxCharacters && ` / ${maxCharacters}`}
                {maxCharacters && isOverLimit && " (over limit)"}
              </span>
            </div>
          )}

          {/* Validation messages */}
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

          {/* Auto-save status */}
          {autoSave && autoSaveState.lastSaved && !autoSaveState.isSaving && (
            <p className="text-xs text-muted-foreground">
              Last saved: {autoSaveState.lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }
);

EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedTextarea };