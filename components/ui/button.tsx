import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";;
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive touch-manipulation active-press select-none focus-enterprise",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-professional-sm hover:bg-primary/90 active:bg-primary/95 hover-lift",
        destructive:
          "bg-destructive text-white shadow-professional-sm hover:bg-destructive/90 active:bg-destructive/95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover-lift",
        outline:
          "border bg-background shadow-professional-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover-lift",
        secondary:
          "bg-secondary text-secondary-foreground shadow-professional-xs hover:bg-secondary/80 active:bg-secondary/90 hover-lift",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50 transition-professional",
        link:
          "text-primary underline-offset-4 hover:underline active:text-primary/80 transition-professional",
        // Professional cybersecurity variants
        success:
          "bg-status-success text-status-success-foreground shadow-professional-sm hover:bg-status-success/90 active:bg-status-success/95 hover-lift",
        warning:
          "bg-status-warning text-status-warning-foreground shadow-professional-sm hover:bg-status-warning/90 active:bg-status-warning/95 hover-lift",
        danger:
          "bg-status-critical text-status-critical-foreground shadow-professional-sm hover:bg-status-critical/90 active:bg-status-critical/95 hover-lift",
        // Subtle variants for secondary actions
        "outline-success":
          "border border-status-success text-status-success bg-status-success/10 hover:bg-status-success/20 shadow-professional-xs hover-lift",
        "outline-warning":
          "border border-status-warning text-status-warning bg-status-warning/10 hover:bg-status-warning/20 shadow-professional-xs hover-lift",
        "outline-danger":
          "border border-status-critical text-status-critical bg-status-critical/10 hover:bg-status-critical/20 shadow-professional-xs hover-lift",
      },
      size: {
        xs: "h-8 lg:h-7 rounded-sm px-2.5 text-xs gap-1 min-h-[32px] lg:min-h-[28px]",
        sm: "h-9 lg:h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-h-[36px] lg:min-h-[32px]",
        default: "h-10 lg:h-9 px-4 py-2 has-[>svg]:px-3 min-h-[44px] lg:min-h-[36px]",
        lg: "h-12 lg:h-10 rounded-md px-6 has-[>svg]:px-4 min-h-[48px] lg:min-h-[40px] text-base",
        xl: "h-14 lg:h-12 rounded-lg px-8 has-[>svg]:px-6 min-h-[56px] lg:min-h-[48px] text-lg font-semibold",
        icon: "size-11 lg:size-9 min-h-[44px] min-w-[44px] lg:min-h-[36px] lg:min-w-[36px]",
        "icon-sm": "size-9 lg:size-8 min-h-[36px] min-w-[36px] lg:min-h-[32px] lg:min-w-[32px]",
        "icon-lg": "size-12 lg:size-10 min-h-[48px] min-w-[48px] lg:min-h-[40px] lg:min-w-[40px]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        loading && "cursor-not-allowed opacity-70",
        className
      )}
      disabled={disabled || loading}
      {...props}
      // Ensure buttons work well with touch devices
      style={{
        WebkitTapHighlightColor: 'transparent',
        ...('style' in props ? props.style : {}),
      }}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants, type ButtonProps };
