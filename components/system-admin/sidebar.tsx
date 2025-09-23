'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Settings,
  FileText,
  Database,
  Shield,
  BarChart3,
  Package,
  Key,
  Gauge,
  Layers,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: Gauge,
  },
  {
    label: 'Organizations',
    icon: Building2,
    children: [
      { label: 'All Organizations', href: '/admin/organizations', icon: Building2 },
      { label: 'Create Organization', href: '/admin/organizations/new', icon: Building2 },
      { label: 'Provisioning', href: '/admin/organizations/provisioning', icon: Package },
    ],
  },
  {
    label: 'Users',
    icon: Users,
    children: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'System Admins', href: '/admin/users/admins', icon: Shield },
      { label: 'Activity Logs', href: '/admin/users/activity', icon: FileText },
    ],
  },
  {
    label: 'Licensing',
    icon: Key,
    children: [
      { label: 'License Management', href: '/admin/billing/licenses', icon: Key },
      { label: 'Subscription Plans', href: '/admin/billing/plans', icon: Package },
      { label: 'Usage Reports', href: '/admin/billing/usage', icon: BarChart3 },
    ],
  },
  {
    label: 'Content',
    icon: Layers,
    children: [
      { label: 'System Templates', href: '/admin/content/templates', icon: FileText },
      { label: 'Global Dropdowns', href: '/admin/content/dropdowns', icon: Database },
      { label: 'Default Tags', href: '/admin/content/tags', icon: Layers },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'System Settings', href: '/admin/settings', icon: Settings },
      { label: 'API Keys', href: '/admin/settings/api-keys', icon: Key },
      { label: 'Security', href: '/admin/settings/security', icon: Shield },
    ],
  },
  {
    label: 'Monitoring',
    icon: BarChart3,
    children: [
      { label: 'System Health', href: '/admin/monitoring/health', icon: AlertTriangle },
      { label: 'Audit Logs', href: '/admin/monitoring/audit', icon: FileText },
      { label: 'Analytics', href: '/admin/monitoring/analytics', icon: BarChart3 },
    ],
  },
];

interface SystemAdminSidebarProps {
  user: any;
}

export function SystemAdminSidebar({ user }: SystemAdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-red-500" />
          <div>
            <h2 className="text-xl font-bold">Sekuriti.io</h2>
            <p className="text-xs text-gray-400">System Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.label);
          const isActiveItem = isParentActive(item);

          return (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    isActiveItem
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Children */}
              {item.children && isExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    return (
                      <Link
                        key={child.label}
                        href={child.href!}
                        className={cn(
                          'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive(child.href)
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <ChildIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-gray-400">System Administrator</p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Building2 className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}