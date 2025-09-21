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
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { getTeamForUser } from '@/lib/db/queries';
import { getDashboardStats, getIncidents } from '@/lib/db/queries-ir';

async function DashboardStats() {
  const team = await getTeamForUser();
  if (!team) return null;

  const stats = await getDashboardStats(team.id);
  const recentIncidents = await getIncidents(team.id, {});
  const openIncidents = recentIncidents.filter(i => i.incident.status === 'open');

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openIncidents === 0 ? 'All clear' : 'Requires attention'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Tracked in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Runbooks</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRunbooks}</div>
            <p className="text-xs text-muted-foreground">
              Response procedures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedExercises}</div>
            <p className="text-xs text-muted-foreground">
              Tabletop exercises
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="w-full justify-start">
              <Link href="/incidents/new">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Record New Incident
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/assets/new">
                <Package className="mr-2 h-4 w-4" />
                Add Asset
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/exercises">
                <GraduationCap className="mr-2 h-4 w-4" />
                Start Training
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Incidents</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/incidents">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {openIncidents.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">No open incidents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openIncidents.slice(0, 3).map((item) => {
                  const incident = item.incident;
                  return (
                    <Link
                      key={incident.id}
                      href={`/incidents/${incident.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          incident.severity === 'critical' ? 'bg-red-100' :
                          incident.severity === 'high' ? 'bg-orange-100' :
                          incident.severity === 'medium' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            incident.severity === 'critical' ? 'text-red-600' :
                            incident.severity === 'high' ? 'text-orange-600' :
                            incident.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {incident.referenceNumber} • {incident.classification.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.status === 'open' ? 'bg-red-100 text-red-800' :
                          incident.status === 'contained' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {incident.status}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your organization's security posture
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              New Incident
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
