import { Suspense } from 'react';
import { getTeamForUser } from '@/lib/db/queries';
import { getIncidents } from '@/lib/db/queries-ir';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncidentFilters } from '@/components/incidents/incident-filters';
import { IncidentListClient } from './incident-list-client';
import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Plus
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
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {incidents.map((item) => {
        const incident = item.incident;
        return (
          <Link key={incident.id} href={`/incidents/${incident.id}`}>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full touch-manipulation active:scale-[0.98]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityIcon(incident.severity)}
                      <span className="text-xs font-medium text-gray-500 truncate">
                        {incident.referenceNumber}
                      </span>
                    </div>
                    <CardTitle className="text-sm sm:text-base line-clamp-2 leading-tight">
                      {incident.title}
                    </CardTitle>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getStatusIcon(incident.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-900 font-medium text-right truncate ml-2">
                      {incident.classification.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Detected</span>
                    <span className="text-gray-900 text-right">
                      {new Date(incident.detectedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </span>
                  </div>
                  {incident.assignedTo && item.assignee && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-500">Assigned</span>
                      <span className="text-gray-900 text-right truncate ml-2">
                        {item.assignee.name || item.assignee.email.split('@')[0]}
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

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Incidents</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage and track security incidents across your organization
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto touch-manipulation">
          <Link href="/incidents/new">
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:inline">Record Incident</span>
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        {(async () => {
          const team = await getTeamForUser();
          if (!team) return null;
          const incidents = await getIncidents(team.id, params);
          return <IncidentListClient incidents={incidents} />;
        })()}
      </Suspense>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <IncidentFilters />
        </CardHeader>
        <CardContent className="pt-0">
          <Suspense fallback={<IncidentSkeleton />}>
            <IncidentsList searchParams={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}