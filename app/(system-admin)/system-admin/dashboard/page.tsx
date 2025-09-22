'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  Activity,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  organizations: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  users: {
    total: number;
    verified: number;
    systemAdmins: number;
    newThisWeek: number;
  };
  licenses: {
    total: number;
    average: number;
  };
  revenue: {
    mrr: number;
    subscribedOrgs: number;
  };
  activity: {
    recentActions: number;
  };
}

interface RecentOrganization {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  userCount: number;
}

interface SystemHealth {
  apiStatus: string;
  databaseStatus: string;
  queueStatus: string;
  lastBackup: string;
}

export default function SystemAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrganizations, setRecentOrganizations] = useState<RecentOrganization[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/system-admin/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setStats(data.stats);
      setRecentOrganizations(data.recentOrganizations);
      setSystemHealth(data.systemHealth);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground">
          Monitor and manage your SaaS platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organizations.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.organizations.active} active
              </span>
              <span>•</span>
              <span className="flex items-center text-blue-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.organizations.growth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center text-blue-600">
                <Activity className="h-3 w-3 mr-1" />
                {stats.users.verified} verified
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.revenue.mrr.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.revenue.subscribedOrgs} subscribed orgs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.systemAdmins}</div>
            <div className="text-xs text-muted-foreground">
              Platform administrators
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Organizations</CardTitle>
            <CardDescription>
              Latest organizations created on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrganizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.userCount} users
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${org.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        org.status === 'trial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {org.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Current system status and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemHealth && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 ${systemHealth.apiStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`} />
                    <span className="text-sm">API Status</span>
                  </div>
                  <span className={`text-sm ${systemHealth.apiStatus === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemHealth.apiStatus === 'operational' ? 'Operational' : 'Issues'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 ${systemHealth.databaseStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`} />
                    <span className="text-sm">Database</span>
                  </div>
                  <span className={`text-sm ${systemHealth.databaseStatus === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemHealth.databaseStatus === 'operational' ? 'Healthy' : 'Issues'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 ${systemHealth.queueStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`} />
                    <span className="text-sm">Queue Service</span>
                  </div>
                  <span className={`text-sm ${systemHealth.queueStatus === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemHealth.queueStatus === 'operational' ? 'Active' : 'Issues'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">Last Backup</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(systemHealth.lastBackup).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a
              href="/system-admin/organizations/new"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Building2 className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Create Organization</span>
            </a>
            <a
              href="/system-admin/users"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">Manage Users</span>
            </a>
            <a
              href="/system-admin/content/templates"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Package className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">System Templates</span>
            </a>
            <a
              href="/system-admin/monitoring/audit"
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-muted transition-colors"
            >
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm font-medium">View Audit Logs</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}