'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Package,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Building,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Incidents',
    href: '/incidents',
    icon: AlertTriangle,
    children: [
      { label: 'All Incidents', href: '/incidents', icon: AlertTriangle },
      { label: 'New Incident', href: '/incidents/new', icon: AlertTriangle },
    ]
  },
  {
    label: 'Assets',
    href: '/assets',
    icon: Package,
    children: [
      { label: 'Asset Inventory', href: '/assets', icon: Package },
      { label: 'Asset Groups', href: '/assets/groups', icon: Package },
      { label: 'Add Asset', href: '/assets/new', icon: Package },
    ]
  },
  {
    label: 'Runbooks',
    href: '/runbooks',
    icon: BookOpen,
    children: [
      { label: 'All Runbooks', href: '/runbooks', icon: BookOpen },
      { label: 'New Runbook', href: '/runbooks/new', icon: BookOpen },
    ]
  },
  {
    label: 'Training',
    href: '/exercises',
    icon: GraduationCap,
    children: [
      { label: 'Exercises', href: '/exercises', icon: GraduationCap },
      { label: 'History', href: '/exercises/history', icon: GraduationCap },
      { label: 'Leaderboard', href: '/exercises/leaderboard', icon: GraduationCap },
    ]
  },
  {
    label: 'Communications',
    href: '/communications',
    icon: MessageSquare,
    children: [
      { label: 'Templates', href: '/communications', icon: MessageSquare },
      { label: 'New Template', href: '/communications/new', icon: MessageSquare },
    ]
  },
  {
    label: 'Organization',
    href: '/organization',
    icon: Building,
    children: [
      { label: 'Overview', href: '/organization', icon: Building },
      { label: 'Team', href: '/organization/team', icon: Building },
      { label: 'Settings', href: '/organization/settings', icon: Building },
      { label: 'Billing', href: '/organization/billing', icon: Building },
      { label: 'Audit Log', href: '/organization/audit', icon: Building },
      { label: 'Tags', href: '/organization/tags', icon: Building },
      { label: 'Insurance', href: '/organization/insurance', icon: Building },
    ]
  }
];

function NavItemComponent({
  item,
  isActive,
  isParentActive,
  level = 0
}: {
  item: NavItem;
  isActive: boolean;
  isParentActive: boolean;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(isParentActive);
  const pathname = usePathname();

  // Update expansion state when parent becomes active
  if (isParentActive && !isExpanded) {
    setIsExpanded(true);
  }

  if (!item.children) {
    return (
      <Link href={item.href} className="block">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-9 px-3 font-normal',
            level > 0 && 'ml-4 w-[calc(100%-1rem)]',
            isActive && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <item.icon className="mr-3 h-4 w-4" />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant={isParentActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-9 px-3 font-normal',
            level > 0 && 'ml-4 w-[calc(100%-1rem)]',
            isParentActive && 'bg-accent text-accent-foreground font-medium'
          )}
        >
          <item.icon className="mr-3 h-4 w-4" />
          <span>{item.label}</span>
          {item.badge && (
            <span className="ml-auto mr-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {item.children.map((child) => {
          const childIsActive = pathname === child.href;
          return (
            <NavItemComponent
              key={child.href}
              item={child}
              isActive={childIsActive}
              isParentActive={false}
              level={level + 1}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const checkIfParentActive = (item: NavItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname.startsWith(child.href) || pathname === child.href);
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 transform bg-background border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center border-b px-4">
            <Link href="/" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                <Package className="h-4 w-4" />
              </div>
              <span className="ml-2 text-lg font-semibold">Sekuriti</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isParentActive = checkIfParentActive(item);

              return (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  isParentActive={isParentActive}
                />
              );
            })}
          </nav>

          {/* Settings link at bottom */}
          <div className="border-t p-4">
            <Link href="/dashboard" className="block">
              <Button
                variant={pathname.startsWith('/dashboard') ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-9 px-3 font-normal',
                  pathname.startsWith('/dashboard') && 'bg-accent text-accent-foreground font-medium'
                )}
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0" />
    </>
  );
}