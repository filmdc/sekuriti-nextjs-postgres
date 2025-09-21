import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Dashboard', href: '/', icon: Home }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
              )}

              {isLast ? (
                <span className="flex items-center font-medium text-foreground">
                  {Icon && <Icon className="mr-1 h-4 w-4" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="mr-1 h-4 w-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbSeparator() {
  return <ChevronRight className="h-4 w-4 text-muted-foreground/60" />;
}

export function BreadcrumbList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ol className={cn('flex flex-wrap items-center break-words text-sm text-muted-foreground', className)}>
      {children}
    </ol>
  );
}

export function BreadcrumbItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', className)}>
      {children}
    </li>
  );
}

export function BreadcrumbLink({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function BreadcrumbPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
    >
      {children}
    </span>
  );
}