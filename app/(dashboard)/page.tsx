import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  Package,
  GraduationCap,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { getTeamForUser } from '@/lib/db/queries';
import { getDashboardStats, getIncidents } from '@/lib/db/queries-ir';

// Dashboard widgets
import { IncidentSummaryWidget } from '@/components/dashboard/incident-summary-widget';
import { AssetStatusWidget } from '@/components/dashboard/asset-status-widget';
import { TeamActivityWidget } from '@/components/dashboard/team-activity-widget';
import { RunbookActivityWidget } from '@/components/dashboard/runbook-activity-widget';
import { CriticalAlertsWidget } from '@/components/dashboard/critical-alerts-widget';

async function DashboardStats() {
  const team = await getTeamForUser();
  if (!team) return null;

  const stats = await getDashboardStats(team.id);
  const recentIncidents = await getIncidents(team.id, {});
  const openIncidents = recentIncidents.filter(i => i.incident.status === 'open');

  // Mock data for new widgets - in production, these would come from actual database queries
  const mockAssets = [
    { id: 1, name: 'Production DB Server', type: 'database', criticality: 'critical' as const, status: 'active' as const },
    { id: 2, name: 'Web Application Server', type: 'application', criticality: 'high' as const, status: 'active' as const },
    { id: 3, name: 'Backup Storage', type: 'storage', criticality: 'medium' as const, status: 'maintenance' as const }
  ];

  const mockTeamActivity = [
    {
      id: 1,
      type: 'incident_created' as const,
      description: 'Created new security incident for phishing campaign',
      user: { id: 1, name: 'John Doe', email: 'john@company.com' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      type: 'asset_added' as const,
      description: 'Added new database server to asset inventory',
      user: { id: 2, name: 'Jane Smith', email: 'jane@company.com' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    }
  ];

  const mockRunbookExecutions = [
    {
      id: 1,
      runbookTitle: 'Incident Response - Data Breach',
      executorName: 'Security Team',
      status: 'running' as const,
      progress: 65,
      startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      stepsCompleted: 13,
      totalSteps: 20,
      incidentId: 1
    }
  ];

  const mockCriticalAlerts = [
    {
      id: 1,
      type: 'security_breach' as const,
      title: 'Unusual Login Activity Detected',
      description: 'Multiple failed login attempts from unknown IP addresses detected on production systems',
      severity: 'critical' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      source: 'Security Monitor',
      actionRequired: true,
      url: '/incidents/new'
    },
    {
      id: 2,
      type: 'compliance_violation' as const,
      title: 'Data Retention Policy Violation',
      description: 'Customer data found to be retained beyond policy limits in legacy system',
      severity: 'high' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      source: 'Compliance Scanner',
      actionRequired: true
    }
  ];

  return (
    <>
      {/* Key Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="touch-manipulation hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openIncidents === 0 ? 'All clear' : 'Attention needed'}
            </p>
          </CardContent>
        </Card>
        <Card className="touch-manipulation hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Protected Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              In inventory
            </p>
          </CardContent>
        </Card>
        <Card className="touch-manipulation hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Runbooks</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.activeRunbooks}</div>
            <p className="text-xs text-muted-foreground">
              Procedures
            </p>
          </CardContent>
        </Card>
        <Card className="touch-manipulation hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Training Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.completedExercises}</div>
            <p className="text-xs text-muted-foreground">
              Exercises
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts & Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
        <CriticalAlertsWidget
          alerts={mockCriticalAlerts}
          totalAlerts={mockCriticalAlerts.length}
          alertTrend="up"
          trendPercentage={15}
        />
        <Card className="border-2 border-dashed lg:order-2">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start h-11 sm:h-10">
              <Link href="/incidents/new">
                <AlertTriangle className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Record New Incident</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-11 sm:h-10">
              <Link href="/assets/new">
                <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Add Asset</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-11 sm:h-10">
              <Link href="/exercises">
                <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Start Training</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-11 sm:h-10">
              <Link href="/runbooks">
                <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">View Runbooks</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        <IncidentSummaryWidget
          incidents={openIncidents}
          totalOpen={stats.openIncidents}
        />
      </div>

      {/* Asset & Team Management */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        <AssetStatusWidget
          totalAssets={stats.totalAssets}
          criticalAssets={Math.floor(stats.totalAssets * 0.1)}
          mustContactAssets={Math.floor(stats.totalAssets * 0.3)}
          recentAssets={mockAssets}
        />
        <TeamActivityWidget
          activities={mockTeamActivity}
          activeMembers={5}
          totalMembers={8}
        />
      </div>

      {/* Runbook Activity */}
      <div className="grid gap-3 sm:gap-4">
        <RunbookActivityWidget
          executions={mockRunbookExecutions}
          totalRunbooks={stats.activeRunbooks}
          activeExecutions={1}
        />
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Posture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium">Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Asset Coverage</span>
                <span className="text-sm font-medium">Good</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Readiness</span>
                <span className="text-sm font-medium">Improving</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
        <div className="md:col-span-2 h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Monitor and manage your organization's security posture
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:inline">New Incident</span>
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
