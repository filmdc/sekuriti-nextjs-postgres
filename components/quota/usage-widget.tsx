'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuotaProgressBar } from './quota-progress-bar';
import { formatStorage, type OrganizationLimits, type QuotaUsage } from '@/lib/types/license';
import {
  Users,
  HardDrive,
  FileText,
  Shield,
  BookOpen,
  MessageSquare,
  Zap,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UsageWidgetProps {
  limits: OrganizationLimits;
  className?: string;
  compact?: boolean;
  showUpgradeButton?: boolean;
}

interface ResourceUsage {
  icon: React.ReactNode;
  label: string;
  current: number;
  limit: number | null;
  formatter?: (value: number) => string;
  href?: string;
}

export function UsageWidget({
  limits,
  className,
  compact = false,
  showUpgradeButton = true,
}: UsageWidgetProps) {
  const resources: ResourceUsage[] = [
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Users',
      current: limits.currentUsers,
      limit: limits.maxUsers,
      href: '/organization/team',
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: 'Storage',
      current: limits.currentStorageMb,
      limit: limits.maxStorageMb,
      formatter: formatStorage,
    },
    {
      icon: <Shield className="h-4 w-4" />,
      label: 'Incidents',
      current: 0, // Will be populated from actual data
      limit: limits.maxIncidents,
      href: '/incidents',
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Assets',
      current: 0, // Will be populated from actual data
      limit: limits.maxAssets,
      href: '/assets',
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Runbooks',
      current: 0, // Will be populated from actual data
      limit: limits.maxRunbooks,
      href: '/runbooks',
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      label: 'Templates',
      current: 0, // Will be populated from actual data
      limit: limits.maxTemplates,
      href: '/communications',
    },
  ];

  const criticalResources = resources.filter((r) => {
    if (!r.limit) return false;
    const percentage = (r.current / r.limit) * 100;
    return percentage >= 90;
  });

  const warningResources = resources.filter((r) => {
    if (!r.limit) return false;
    const percentage = (r.current / r.limit) * 100;
    return percentage >= 80 && percentage < 90;
  });

  if (compact) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Usage Overview</CardTitle>
            {(criticalResources.length > 0 || warningResources.length > 0) && (
              <Badge variant={criticalResources.length > 0 ? 'destructive' : 'secondary'}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {criticalResources.length + warningResources.length} Warnings
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {resources.slice(0, 3).map((resource, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                {resource.icon}
                <span className="font-medium">{resource.label}</span>
                {resource.href && (
                  <Link
                    href={resource.href}
                    className="ml-auto text-xs text-muted-foreground hover:text-primary"
                  >
                    View
                  </Link>
                )}
              </div>
              <QuotaProgressBar
                current={resource.current}
                limit={resource.limit}
                showIcon={false}
                showValues={true}
                formatter={resource.formatter}
                className="ml-6"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/organization/billing">View All</Link>
            </Button>
            {showUpgradeButton && (
              <Button size="sm" className="flex-1" asChild>
                <Link href="/pricing">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Upgrade
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Monitor your organization's resource consumption</CardDescription>
          </div>
          {showUpgradeButton && (
            <Button size="sm" asChild>
              <Link href="/pricing">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(criticalResources.length > 0 || warningResources.length > 0) && (
          <div className="mb-4 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Resource Limits Approaching
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  {criticalResources.length > 0 && (
                    <>
                      Critical: {criticalResources.map((r) => r.label).join(', ')}
                      {warningResources.length > 0 && ' • '}
                    </>
                  )}
                  {warningResources.length > 0 && (
                    <>Warning: {warningResources.map((r) => r.label).join(', ')}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {resource.icon}
                  <span className="font-medium">{resource.label}</span>
                </div>
                {resource.href && (
                  <Link
                    href={resource.href}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Manage
                  </Link>
                )}
              </div>
              <QuotaProgressBar
                current={resource.current}
                limit={resource.limit}
                showIcon={true}
                formatter={resource.formatter}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">API Usage</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>
                  {limits.apiCallsThisHour} / {limits.apiRateLimit || 'Unlimited'} calls/hour
                </span>
              </div>
              {limits.apiResetAt && (
                <p className="text-xs text-muted-foreground">
                  Resets at {new Date(limits.apiResetAt).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Features</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={limits.ssoAllowed ? 'default' : 'outline'} className="text-xs">
                  SSO {!limits.ssoAllowed && '🔒'}
                </Badge>
                <Badge
                  variant={limits.customDomainsAllowed ? 'default' : 'outline'}
                  className="text-xs"
                >
                  Custom Domains {!limits.customDomainsAllowed && '🔒'}
                </Badge>
                <Badge
                  variant={limits.whitelabelingAllowed ? 'default' : 'outline'}
                  className="text-xs"
                >
                  White-label {!limits.whitelabelingAllowed && '🔒'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}