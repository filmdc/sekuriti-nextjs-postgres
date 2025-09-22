import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { db } from '@/lib/db/drizzle';
import { teams, users } from '@/lib/db/schema';
import { incidents } from '@/lib/db/schema-ir';
import { sql, eq } from 'drizzle-orm';

async function getSystemStats() {
  const [organizationCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(teams);

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`${users.deletedAt} IS NULL`);

  const [activeSubscriptions] = await db
    .select({ count: sql<number>`count(*)` })
    .from(teams)
    .where(eq(teams.subscriptionStatus, 'active'));

  const [incidentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(incidents);

  return {
    organizations: Number(organizationCount.count),
    users: Number(userCount.count),
    activeSubscriptions: Number(activeSubscriptions.count),
    incidents: Number(incidentCount.count),
  };
}

export default async function SystemAdminDashboard() {
  const stats = await getSystemStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all organizations and users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold mt-1">{stats.organizations}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-600 ml-1">from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold mt-1">{stats.users}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-600 ml-1">from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              ${(stats.activeSubscriptions * 99).toLocaleString()} MRR
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold mt-1">{stats.incidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-gray-600">Across all organizations</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Organizations</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Acme Corporation</p>
                <p className="text-sm text-gray-600">25 users • Enterprise plan</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">TechStart Inc</p>
                <p className="text-sm text-gray-600">8 users • Professional plan</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">GlobalSec Ltd</p>
                <p className="text-sm text-gray-600">5 users • Trial</p>
              </div>
              <Badge variant="secondary">Trial</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connections</span>
              <span className="text-sm font-medium">12/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage Used</span>
              <span className="text-sm font-medium">2.4TB / 10TB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Uptime</span>
              <span className="text-sm font-medium text-green-600">99.99%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="text-sm font-medium text-green-600">0.02%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}