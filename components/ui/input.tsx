import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);

  React.useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(String(props.value).length > 0);
    }
  }, [props.value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs",
        "transition-[color,box-shadow,border-color] outline-none touch-manipulation",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // Mobile-optimized sizing
        "h-11 py-2 lg:h-9 lg:py-1 lg:text-sm",
        "min-h-[44px] lg:min-h-[36px]", // Touch target size
        // Enhanced focus states
        isFocused && "shadow-md ring-2 ring-primary/20 border-primary",
        hasValue && "text-foreground",
        className
      )}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      style={{
        WebkitTapHighlightColor: 'transparent',
        // Prevent zoom on iOS for certain input types
        fontSize: type === 'email' || type === 'tel' || type === 'url' ? '16px' : undefined,
        ...('style' in props ? props.style : {}),
      }}
      autoComplete={type === 'password' ? 'current-password' : props.autoComplete}
      {...props}
    />
  );
}

export { Input };
