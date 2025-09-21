'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileTableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  priority?: 'high' | 'medium' | 'low'; // Controls visibility on small screens
  sortable?: boolean;
}

interface MobileTableProps {
  data: any[];
  columns: MobileTableColumn[];
  onRowClick?: (row: any) => void;
  onRowAction?: (action: string, row: any) => void;
  actions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }>;
  emptyState?: React.ReactNode;
  loading?: boolean;
  className?: string;
  cardMode?: boolean; // Switch between card and table mode
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

const MobileTableSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const MobileCard = ({
  row,
  columns,
  onRowClick,
  actions,
  onRowAction
}: {
  row: any;
  columns: MobileTableColumn[];
  onRowClick?: (row: any) => void;
  actions?: MobileTableProps['actions'];
  onRowAction?: (action: string, row: any) => void;
}) => {
  const primaryColumn = columns.find(c => c.priority === 'high') || columns[0];
  const secondaryColumns = columns.filter(c => c !== primaryColumn && c.priority !== 'low');
  const tertiaryColumns = columns.filter(c => c.priority === 'low');

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onRowClick && 'cursor-pointer hover:bg-accent/5'
      )}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Primary content */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-sm truncate">
                {primaryColumn.render
                  ? primaryColumn.render(row[primaryColumn.key], row)
                  : row[primaryColumn.key]
                }
              </h3>
              {onRowClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>

            {/* Secondary content */}
            <div className="space-y-1">
              {secondaryColumns.slice(0, 2).map((column) => (
                <div key={column.key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{column.label}</span>
                  <span className="font-medium">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </span>
                </div>
              ))}
            </div>

            {/* Tertiary content - only show if space allows */}
            {tertiaryColumns.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tertiaryColumns.slice(0, 3).map((column) => {
                  const value = column.render
                    ? column.render(row[column.key], row)
                    : row[column.key];

                  if (typeof value === 'string' || typeof value === 'number') {
                    return (
                      <Badge key={column.key} variant="secondary" className="text-xs">
                        {value}
                      </Badge>
                    );
                  }
                  return value;
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          {actions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {actions.map((action) => (
                  <button
                    key={action.action}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowAction?.(action.action, row);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                      action.variant === 'destructive' && 'text-destructive hover:text-destructive'
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MobileTable = React.forwardRef<
  HTMLDivElement,
  MobileTableProps
>(({
  data,
  columns,
  onRowClick,
  onRowAction,
  actions,
  emptyState,
  loading,
  className,
  cardMode = true,
  sortBy,
  sortDirection,
  onSort,
  ...props
}, ref) => {
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (loading) {
    return <MobileTableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        {emptyState || (
          <div>
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    );
  }

  // On small screens or when cardMode is forced, use card layout
  if (isSmallScreen || cardMode) {
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {data.map((row, index) => (
          <MobileCard
            key={row.id || index}
            row={row}
            columns={columns}
            onRowClick={onRowClick}
            actions={actions}
            onRowAction={onRowAction}
          />
        ))}
      </div>
    );
  }

  // On larger screens, use responsive table
  return (
    <div ref={ref} className={cn('relative w-full', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                    column.sortable && onSort && 'cursor-pointer hover:text-foreground',
                    column.priority === 'low' && 'hidden lg:table-cell'
                  )}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      <span className="text-xs">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={cn(
                  'border-b transition-colors hover:bg-muted/50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'p-4 align-middle',
                      column.priority === 'low' && 'hidden lg:table-cell'
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="p-4 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action) => (
                          <button
                            key={action.action}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowAction?.(action.action, row);
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent',
                              action.variant === 'destructive' && 'text-destructive'
                            )}
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

MobileTable.displayName = 'MobileTable';

export { MobileTable, type MobileTableColumn };