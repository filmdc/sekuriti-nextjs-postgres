'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsageWidget } from '@/components/quota/usage-widget';
import { QuotaWarningBadge } from '@/components/quota/quota-warning-badge';
import { useOrganizationLimits, useOrganizationUsage } from '@/lib/hooks/use-organization-limits';
import {
  Activity,
  AlertTriangle,
  FileText,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { formatStorage } from '@/lib/types/license';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
  trend?: number;
  quota?: {
    current: number;
    limit: number | null;
  };
}

function StatCard({ title, value, subtitle, icon, href, trend, quota }: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {quota && quota.limit && (
            <QuotaWarningBadge
              current={quota.current}
              limit={quota.limit}
              resource={title.toLowerCase()}
              showOnlyWarning={true}
            />
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : trend < 0 ? (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <span className={`text-xs ml-1 ${
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function RecentActivity() {
  const { data: activities } = useSWR('/api/organization/audit?limit=5', fetcher);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities?.map((activity: any, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-full">
                <Activity className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {!activities && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IncidentStatus() {
  const { data: incidents } = useSWR('/api/incidents?limit=5&status=open', fetcher);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'open':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>Current security incidents requiring attention</CardDescription>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/incidents">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents?.map((incident: any) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(incident.status)}
                    <p className="font-medium text-sm">{incident.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(incident.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
            </Link>
          ))}
          {(!incidents || incidents.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <p>No active incidents</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const { limits, isLoading: limitsLoading } = useOrganizationLimits();
  const { usage, isLoading: usageLoading } = useOrganizationUsage();

  // Calculate some mock statistics (would come from API in production)
  const stats = {
    openIncidents: 3,
    criticalAssets: 12,
    activeRunbooks: 5,
    teamMembers: usage?.users || 0,
    monthlyIncidents: 8,
    resolvedThisMonth: 5,
    avgResolutionTime: '4.2 hours',
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's your security overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/incidents/new">
              <AlertTriangle className="h-4 w-4 mr-2" />
              New Incident
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Incidents"
          value={stats.openIncidents}
          subtitle={`${stats.resolvedThisMonth} resolved this month`}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          href="/incidents"
          trend={-15}
          quota={limits && { current: usage?.incidents || 0, limit: limits.maxIncidents }}
        />
        <StatCard
          title="Critical Assets"
          value={stats.criticalAssets}
          subtitle={`${usage?.assets || 0} total assets`}
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          href="/assets"
          quota={limits && { current: usage?.assets || 0, limit: limits.maxAssets }}
        />
        <StatCard
          title="Active Runbooks"
          value={stats.activeRunbooks}
          subtitle={`${usage?.runbooks || 0} total runbooks`}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          href="/runbooks"
          quota={limits && { current: usage?.runbooks || 0, limit: limits.maxRunbooks }}
        />
        <StatCard
          title="Team Members"
          value={stats.teamMembers}
          subtitle="Active users"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          href="/organization/team"
          trend={20}
          quota={limits && { current: usage?.users || 0, limit: limits.maxUsers }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Usage Widget - Takes up 3 columns */}
        <div className="lg:col-span-3">
          {limits && (
            <UsageWidget
              limits={{
                ...limits,
                currentUsers: usage?.users || 0,
                currentStorageMb: usage?.storageMb || 0,
              }}
              compact={false}
              showUpgradeButton={true}
            />
          )}
        </div>

        {/* Recent Activity - Takes up 4 columns */}
        <div className="lg:col-span-4 space-y-4">
          <IncidentStatus />
          <RecentActivity />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↓ 23%</span> improvement from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Incidents</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyIncidents}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {stats.resolvedThisMonth} resolved
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {stats.openIncidents} open
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatStorage(usage?.storageMb || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatStorage(limits?.maxStorageMb || 1024)} available
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}