'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  BookOpen,
  MessageSquare,
  Package,
  Zap,
  User,
  Settings,
  Filter,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  color?: 'red' | 'orange' | 'green' | 'blue' | 'purple';
  badge?: string | number;
  description?: string;
}

interface QuickActionsProps {
  className?: string;
  triggerClassName?: string;
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-incident',
    label: 'Report Incident',
    icon: <AlertTriangle className="h-5 w-5" />,
    href: '/incidents/new',
    color: 'red',
    description: 'Quickly report a new security incident',
  },
  {
    id: 'active-incidents',
    label: 'Active Incidents',
    icon: <Clock className="h-5 w-5" />,
    href: '/incidents?status=open',
    color: 'orange',
    badge: '3',
    description: 'View incidents requiring attention',
  },
  {
    id: 'search',
    label: 'Search',
    icon: <Search className="h-5 w-5" />,
    action: () => {
      // Focus search input or open search modal
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    color: 'blue',
    description: 'Search across all resources',
  },
  {
    id: 'runbooks',
    label: 'Runbooks',
    icon: <BookOpen className="h-5 w-5" />,
    href: '/runbooks',
    color: 'green',
    description: 'Access incident response procedures',
  },
  {
    id: 'communications',
    label: 'Templates',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/communications',
    color: 'purple',
    description: 'Communication templates',
  },
  {
    id: 'assets',
    label: 'Asset Inventory',
    icon: <Package className="h-5 w-5" />,
    href: '/assets',
    color: 'blue',
    description: 'View and manage assets',
  },
];

const getActionColor = (color?: string) => {
  switch (color) {
    case 'red':
      return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200';
    case 'orange':
      return 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200';
    case 'green':
      return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200';
    case 'blue':
      return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200';
    case 'purple':
      return 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200';
  }
};

function QuickActionButton({
  action,
  onActionComplete,
}: {
  action: QuickAction;
  onActionComplete?: () => void;
}) {
  const handleClick = () => {
    if (action.action) {
      action.action();
    }
    onActionComplete?.();
  };

  const buttonContent = (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all duration-200 w-full h-20 flex flex-col items-center justify-center touch-manipulation active:scale-95',
        getActionColor(action.color)
      )}
    >
      {action.badge && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {action.badge}
        </Badge>
      )}
      <div className="mb-1">{action.icon}</div>
      <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
    </div>
  );

  if (action.href) {
    return (
      <Link href={action.href} onClick={onActionComplete}>
        {buttonContent}
      </Link>
    );
  }

  return <button onClick={handleClick}>{buttonContent}</button>;
}

export function QuickActions({
  className,
  triggerClassName,
  actions = defaultActions,
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className={cn(
            'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg touch-manipulation lg:hidden',
            triggerClassName
          )}
        >
          <Zap className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className={cn('h-[400px] rounded-t-xl', className)}
      >
        <SheetHeader className="text-center">
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Access frequently used features and shortcuts
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {actions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onActionComplete={() => setIsOpen(false)}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Enhanced Quick Actions with more contextual actions
export function ContextualQuickActions({
  context,
  className,
}: {
  context: 'incident' | 'asset' | 'runbook' | 'communication';
  className?: string;
}) {
  const getContextActions = (context: string): QuickAction[] => {
    switch (context) {
      case 'incident':
        return [
          {
            id: 'escalate',
            label: 'Escalate',
            icon: <AlertTriangle className="h-4 w-4" />,
            color: 'red',
            action: () => console.log('Escalate incident'),
          },
          {
            id: 'assign',
            label: 'Assign',
            icon: <User className="h-4 w-4" />,
            color: 'blue',
            action: () => console.log('Assign incident'),
          },
          {
            id: 'status',
            label: 'Update Status',
            icon: <RotateCcw className="h-4 w-4" />,
            color: 'orange',
            action: () => console.log('Update status'),
          },
          {
            id: 'notes',
            label: 'Add Notes',
            icon: <MessageSquare className="h-4 w-4" />,
            color: 'green',
            action: () => console.log('Add notes'),
          },
          {
            id: 'resolve',
            label: 'Resolve',
            icon: <CheckCircle className="h-4 w-4" />,
            color: 'green',
            action: () => console.log('Resolve incident'),
          },
          {
            id: 'runbook',
            label: 'Run Playbook',
            icon: <BookOpen className="h-4 w-4" />,
            color: 'purple',
            href: '/runbooks',
          },
        ];
      default:
        return defaultActions.slice(0, 6);
    }
  };

  return (
    <div className={cn('grid grid-cols-3 gap-2', className)}>
      {getContextActions(context).map((action) => (
        <QuickActionButton key={action.id} action={action} />
      ))}
    </div>
  );
}