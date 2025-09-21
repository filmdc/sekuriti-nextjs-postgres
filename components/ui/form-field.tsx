'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  optional?: boolean;
  tooltip?: string;
  description?: string;
  className?: string;
  htmlFor?: string;
  showOptionalText?: boolean;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    children,
    label,
    error,
    success,
    helperText,
    required,
    optional,
    tooltip,
    description,
    className,
    htmlFor,
    showOptionalText = true,
    ...props
  }, ref) => {
    const fieldId = htmlFor || React.useId();

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Label with tooltip and required/optional indicators */}
        {label && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label
                htmlFor={fieldId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
                {optional && showOptionalText && (
                  <span className="text-muted-foreground ml-1 font-normal text-xs">
                    (optional)
                  </span>
                )}
              </label>

              {/* Tooltip */}
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <HelpCircle className="h-3 w-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* Form element */}
        <div className="space-y-1">
          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            'aria-invalid': error ? 'true' : 'false',
            'aria-describedby': [
              error && `${fieldId}-error`,
              success && `${fieldId}-success`,
              helperText && `${fieldId}-helper`,
            ].filter(Boolean).join(' ') || undefined,
          })}

          {/* Messages */}
          <div className="space-y-1">
            {error && (
              <p
                id={`${fieldId}-error`}
                className="text-xs text-destructive flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            )}

            {success && !error && (
              <p
                id={`${fieldId}-success`}
                className="text-xs text-green-600 flex items-center gap-1"
              >
                <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                {success}
              </p>
            )}

            {helperText && !error && !success && (
              <p
                id={`${fieldId}-helper`}
                className="text-xs text-muted-foreground flex items-start gap-1"
              >
                <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                {helperText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;