import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-xs",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        // Cybersecurity status variants
        critical:
          "border-transparent bg-status-critical text-status-critical-foreground hover:bg-status-critical/90 shadow-sm animate-pulse",
        high:
          "border-transparent bg-status-high text-status-high-foreground hover:bg-status-high/90 shadow-xs",
        medium:
          "border-transparent bg-status-medium text-status-medium-foreground hover:bg-status-medium/90 shadow-xs",
        low:
          "border-transparent bg-status-low text-status-low-foreground hover:bg-status-low/90 shadow-xs",
        info:
          "border-transparent bg-status-info text-status-info-foreground hover:bg-status-info/90 shadow-xs",
        success:
          "border-transparent bg-status-success text-status-success-foreground hover:bg-status-success/90 shadow-xs",
        warning:
          "border-transparent bg-status-warning text-status-warning-foreground hover:bg-status-warning/90 shadow-xs",
        // Professional outlined variants
        "critical-outline":
          "border-status-critical text-status-critical bg-status-critical/10 hover:bg-status-critical/20",
        "high-outline":
          "border-status-high text-status-high bg-status-high/10 hover:bg-status-high/20",
        "medium-outline":
          "border-status-medium text-status-medium bg-status-medium/10 hover:bg-status-medium/20",
        "low-outline":
          "border-status-low text-status-low bg-status-low/10 hover:bg-status-low/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-sm font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, size, pulse = false, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// Helper function for security status badges
function StatusBadge({
  status,
  children,
  outline = false,
  ...props
}: {
  status: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning';
  children: React.ReactNode;
  outline?: boolean;
} & Omit<BadgeProps, 'variant'>) {
  const variant = outline ? `${status}-outline` as const : status;

  return (
    <Badge
      variant={variant}
      pulse={status === 'critical'}
      {...props}
    >
      {children}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };