'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  List,
  Tags,
  Users,
  Settings,
  BarChart,
  Shield,
  Building,
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Content Management',
    items: [
      {
        title: 'Templates',
        href: '/system-admin/content/templates',
        icon: FileText,
      },
      {
        title: 'Dropdowns',
        href: '/system-admin/content/dropdowns',
        icon: List,
      },
      {
        title: 'Tag Templates',
        href: '/system-admin/content/tags',
        icon: Tags,
      },
    ],
  },
  {
    title: 'System Management',
    items: [
      {
        title: 'Organizations',
        href: '/system-admin/organizations',
        icon: Building,
      },
      {
        title: 'Users',
        href: '/system-admin/users',
        icon: Users,
      },
      {
        title: 'Monitoring',
        href: '/system-admin/monitoring',
        icon: BarChart,
      },
      {
        title: 'Security',
        href: '/system-admin/security',
        icon: Shield,
      },
      {
        title: 'Settings',
        href: '/system-admin/settings',
        icon: Settings,
      },
    ],
  },
];

export default function SystemAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h2 className="text-lg font-semibold">System Admin</h2>
            <p className="text-sm text-muted-foreground">
              Platform administration
            </p>
          </div>
          <nav className="flex-1 space-y-6 px-3">
            {sidebarItems.map((group) => (
              <div key={group.title}>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                          pathname === item.href && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container p-6">{children}</div>
      </main>
    </div>
  );
}