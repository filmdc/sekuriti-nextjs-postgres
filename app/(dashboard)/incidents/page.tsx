import { Suspense } from 'react';
import { getTeamForUser } from '@/lib/db/queries';
import { getIncidents } from '@/lib/db/queries-ir';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

function IncidentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'medium':
      return <Shield className="h-5 w-5 text-yellow-500" />;
    default:
      return <Shield className="h-5 w-5 text-blue-500" />;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'closed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'open':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'closed':
      return 'bg-green-100 text-green-800';
    case 'open':
      return 'bg-red-100 text-red-800';
    case 'contained':
      return 'bg-yellow-100 text-yellow-800';
    case 'eradicated':
      return 'bg-blue-100 text-blue-800';
    case 'recovered':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

async function IncidentsList({ searchParams }: { searchParams: any }) {
  const team = await getTeamForUser();
  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No organization found</p>
      </div>
    );
  }

  const incidents = await getIncidents(team.id, {
    status: searchParams.status,
    severity: searchParams.severity,
    classification: searchParams.classification,
    search: searchParams.search,
  });

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
        <p className="text-gray-500 mb-6">
          {searchParams.search
            ? "No incidents match your search criteria"
            : "Great news! You haven't recorded any incidents yet"}
        </p>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            Record Incident
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map((item) => {
        const incident = item.incident;
        return (
          <Link key={incident.id} href={`/incidents/${incident.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityIcon(incident.severity)}
                      <span className="text-sm font-medium text-gray-500">
                        {incident.referenceNumber}
                      </span>
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {incident.title}
                    </CardTitle>
                  </div>
                  {getStatusIcon(incident.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Classification</span>
                    <span className="text-gray-900 font-medium">
                      {incident.classification.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Detected</span>
                    <span className="text-gray-900">
                      {new Date(incident.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {incident.assignedTo && item.assignee && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Assigned</span>
                      <span className="text-gray-900">
                        {item.assignee.name || item.assignee.email}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function IncidentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Incidents</h2>
          <p className="text-muted-foreground mt-2">
            Manage and track security incidents across your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            Record Incident
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <form>
                  <Input
                    name="search"
                    placeholder="Search incidents..."
                    className="pl-10"
                    defaultValue={searchParams.search as string}
                  />
                </form>
              </div>
            </div>
            <div className="flex gap-2">
              <form className="flex gap-2">
                <select
                  name="status"
                  className="px-3 py-2 border rounded-md text-sm"
                  defaultValue={searchParams.status as string}
                  onChange={(e) => e.target.form?.submit()}
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="contained">Contained</option>
                  <option value="eradicated">Eradicated</option>
                  <option value="recovered">Recovered</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  name="severity"
                  className="px-3 py-2 border rounded-md text-sm"
                  defaultValue={searchParams.severity as string}
                  onChange={(e) => e.target.form?.submit()}
                >
                  <option value="">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<IncidentSkeleton />}>
            <IncidentsList searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}