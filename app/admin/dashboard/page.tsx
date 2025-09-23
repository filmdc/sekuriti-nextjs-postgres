'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  RefreshCw,
  ServerCrash,
  Clock,
} from 'lucide-react';
import { useAdminAPI } from '@/lib/hooks/use-admin-api';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SystemStats {
  organizations: number;
  users: number;
  activeSubscriptions: number;
  incidents: number;
  revenue: {
    mrr: number;
    total: number;
    growth: number;
  };
  activity: {
    todayLogins: number;
    weeklyActiveUsers: number;
    newUsersThisMonth: number;
  };
}

interface RecentOrganization {
  id: number;
  name: string;
  userCount: number;
  plan: string;
  status: string;
  createdAt: string;
}

interface SystemHealth {
  apiResponseTime: number;
  dbConnections: {
    used: number;
    total: number;
  };
  storage: {
    used: number;
    total: number;
    unit: string;
  };
  uptime: number;
  errorRate: number;
  lastIncident?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
  metadata?: Record<string, any>;
}

export default function SystemAdminDashboard() {
  // Fetch stats
  const { data: stats, isLoading: statsLoading, mutate: refreshStats } = useAdminAPI<SystemStats>(
    '/api/system-admin/stats'
  );

  // Fetch recent organizations
  const { data: recentOrgs, isLoading: orgsLoading } = useAdminAPI<{
    organizations: RecentOrganization[];
  }>('/api/system-admin/organizations?limit=5&sort=createdAt:desc');

  // Fetch system health
  const { data: health, isLoading: healthLoading } = useAdminAPI<SystemHealth>(
    '/api/system-admin/health'
  );

  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useAdminAPI<{
    activities: RecentActivity[];
  }>('/api/system-admin/activity?limit=10');

  const handleRefresh = () => {
    refreshStats();
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all organizations and users
        </p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={statsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-1">{stats?.organizations || 0}</p>
              )}
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {statsLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+{stats?.activity?.newUsersThisMonth || 0}</span>
                <span className="text-gray-600 ml-1">new this month</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-1">{stats?.users || 0}</p>
              )}
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {statsLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-gray-600">{stats?.activity?.weeklyActiveUsers || 0} active this week</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-1">{stats?.activeSubscriptions || 0}</p>
              )}
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {statsLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="text-gray-600">
                ${(stats?.revenue?.mrr || 0).toLocaleString()} MRR
              </span>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-1">{stats?.incidents || 0}</p>
              )}
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {statsLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-gray-600">Across all organizations</span>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Organizations</h2>
          <div className="space-y-3">
            {orgsLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : recentOrgs?.organizations?.length ? (
              recentOrgs.organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-gray-600">
                      {org.userCount} users • {org.plan} plan
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(org.status)}>
                    {org.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No organizations yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            {healthLoading ? (
              <>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-medium">
                    {health?.apiResponseTime || 0}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Connections</span>
                  <span className="text-sm font-medium">
                    {health?.dbConnections?.used || 0}/{health?.dbConnections?.total || 100}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-sm font-medium">
                    {health?.storage?.used || 0}{health?.storage?.unit || 'GB'} / {health?.storage?.total || 0}{health?.storage?.unit || 'GB'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="text-sm font-medium text-green-600">
                    {health?.uptime || 99.99}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className={`text-sm font-medium ${(health?.errorRate || 0) < 1 ? 'text-green-600' : 'text-orange-600'}`}>
                    {health?.errorRate || 0}%
                  </span>
                </div>
                {health?.lastIncident && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center text-sm text-orange-600">
                      <ServerCrash className="h-4 w-4 mr-1" />
                      <span>Last incident: {formatDistanceToNow(new Date(health.lastIncident), { addSuffix: true })}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent System Activity</h2>
        <div className="space-y-2">
          {activityLoading ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : recentActivity?.activities?.length ? (
            recentActivity.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    {activity.userName && (
                      <span className="font-medium">{activity.userName}</span>
                    )}
                    {' '}
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}