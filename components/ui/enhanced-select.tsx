'use client';

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

export interface EnhancedSelectProps {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  children: React.ReactNode;
  containerClassName?: string;
  id?: string;
}

const EnhancedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    error?: string;
    success?: string;
  }
>(({ className, children, error, success, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      error && "border-destructive focus:ring-destructive",
      success && "border-green-500 focus:ring-green-500",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
EnhancedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const EnhancedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchable?: boolean;
    onSearch?: (value: string) => void;
  }
>(({ className, children, position = "popper", searchable, onSearch, ...props }, ref) => {
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {searchable && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search options..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8 border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
EnhancedSelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    description?: string;
  }
>(({ className, children, description, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <div className="flex flex-col">
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Enhanced Select with wrapper component
const EnhancedSelect = React.forwardRef<
  HTMLDivElement,
  EnhancedSelectProps
>(({
  label,
  error,
  success,
  helperText,
  placeholder,
  value,
  onValueChange,
  disabled,
  required,
  searchable,
  children,
  containerClassName,
  id,
  ...props
}, ref) => {
  const [filteredChildren, setFilteredChildren] = React.useState(children);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter children based on search
  React.useEffect(() => {
    if (!searchable || !searchValue) {
      setFilteredChildren(children);
      return;
    }

    const filterChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // If it's a SelectItem, check if it matches the search
        if (child.type === SelectItem) {
          const childText = typeof child.props.children === 'string'
            ? child.props.children
            : '';

          const matchesSearch = childText
            .toLowerCase()
            .includes(searchValue.toLowerCase());

          return matchesSearch ? child : null;
        }

        // If it's a SelectGroup, filter its children
        if (child.type === SelectGroup) {
          const filteredGroupChildren = filterChildren(child.props.children);
          const hasVisibleChildren = React.Children.count(filteredGroupChildren) > 0;

          return hasVisibleChildren
            ? React.cloneElement(child, {}, filteredGroupChildren)
            : null;
        }

        // For other elements, keep them as is
        return child;
      });
    };

    setFilteredChildren(filterChildren(children));
  }, [children, searchValue, searchable]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  return (
    <div ref={ref} className={cn("space-y-2", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
        <EnhancedSelectTrigger error={error} success={success} id={id}>
          <SelectValue placeholder={placeholder} />
        </EnhancedSelectTrigger>
        <EnhancedSelectContent
          searchable={searchable}
          onSearch={handleSearch}
        >
          {filteredChildren}
        </EnhancedSelectContent>
      </Select>

      {/* Helper text, error, and success messages */}
      <div className="space-y-1">
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}

        {success && !error && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {success}
          </p>
        )}

        {helperText && !error && !success && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    </div>
  );
});

EnhancedSelect.displayName = "EnhancedSelect";

export {
  Select,
  SelectGroup,
  SelectValue,
  EnhancedSelectTrigger as SelectTrigger,
  EnhancedSelectContent as SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  EnhancedSelect,
};