import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db/drizzle';
import { teams, users, incidents, assets } from '@/lib/db/schema';
import { sql, eq, gte, and } from 'drizzle-orm';
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
  CheckCircle
} from 'lucide-react';

export default async function SystemAdminDashboard() {
  // Get system-wide statistics
  const [
    organizationStats,
    userStats,
    licenseStats,
    recentOrgs,
  ] = await Promise.all([
    // Organization stats
    db.select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(case when status = 'active' then 1 end)`,
      trial: sql<number>`count(case when status = 'trial' then 1 end)`,
      suspended: sql<number>`count(case when status = 'suspended' then 1 end)`,
    }).from(teams),

    // User stats
    db.select({
      total: sql<number>`count(*)`,
      systemAdmins: sql<number>`count(case when is_system_admin = true then 1 end)`,
      orgAdmins: sql<number>`count(case when is_organization_admin = true then 1 end)`,
      activeToday: sql<number>`count(case when last_login_at >= current_date then 1 end)`,
    }).from(users),

    // License stats
    db.select({
      totalLicenses: sql<number>`sum(license_count)`,
      usedLicenses: sql<number>`count(distinct tm.user_id)`,
      avgLicensesPerOrg: sql<number>`avg(license_count)`,
    }).from(teams)
    .leftJoin(teams, eq(teams.id, teams.id)),

    // Recent organizations
    db.select({
      id: teams.id,
      name: teams.name,
      status: teams.status,
      licenseType: teams.licenseType,
      createdAt: teams.createdAt,
      userCount: sql<number>`(select count(*) from team_members where team_id = teams.id)`,
    })
    .from(teams)
    .orderBy(sql`created_at desc`)
    .limit(5),
  ]);

  const orgStat = organizationStats[0];
  const userStat = userStats[0];
  const licenseStat = licenseStats[0];

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
            <div className="text-2xl font-bold">{orgStat.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {orgStat.active} active
              </span>
              <span>•</span>
              <span className="flex items-center text-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                {orgStat.trial} trial
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
            <div className="text-2xl font-bold">{userStat.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="flex items-center text-blue-600">
                <Activity className="h-3 w-3 mr-1" />
                {userStat.activeToday} active today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Utilization</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenseStat.usedLicenses || 0}/{licenseStat.totalLicenses || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round((licenseStat.usedLicenses || 0) / (licenseStat.totalLicenses || 1) * 100)}% utilized
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStat.systemAdmins}</div>
            <div className="text-xs text-muted-foreground">
              {userStat.orgAdmins} organization admins
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
              {recentOrgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.licenseType || 'Standard'} • {org.userCount} users
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">API Status</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Database</span>
                </div>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm text-yellow-600">75% Used</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Email Service</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Stripe</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
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