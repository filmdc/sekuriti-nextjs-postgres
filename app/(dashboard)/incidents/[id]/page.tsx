'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Activity,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Incident {
  id: string;
  title: string;
  description: string;
  classification: string;
  severity: string;
  status: string;
  detectionDetails?: string;
  createdAt: string;
  updatedAt: string;
  reportedBy?: string;
  assignedTo?: string;
  phase?: string;
}

const severityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const statusColors = {
  detection: 'bg-purple-500',
  containment: 'bg-orange-500',
  eradication: 'bg-yellow-500',
  recovery: 'bg-blue-500',
  'post-incident': 'bg-green-500',
  closed: 'bg-gray-500',
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncident();
  }, [params.id]);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`/api/incidents/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch incident');
      }
      const data = await response.json();
      setIncident(data);
    } catch (error) {
      console.error('Error fetching incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to load incident details',
        variant: 'destructive',
      });
      router.push('/incidents');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update incident');
      }

      const updatedIncident = await response.json();
      setIncident(updatedIncident);

      toast({
        title: 'Success',
        description: 'Incident status updated successfully',
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to update incident status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Incident not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/incidents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{incident.title}</h1>
              <Badge className={severityColors[incident.severity as keyof typeof severityColors]}>
                {incident.severity}
              </Badge>
              <Badge className={statusColors[incident.status as keyof typeof statusColors] || 'bg-gray-500'}>
                {incident.status || 'Unknown'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Incident #{incident.id} • Created {format(new Date(incident.createdAt), 'PPP')}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classification</p>
                  <p className="text-lg">{incident.classification}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Severity</p>
                  <Badge className={severityColors[incident.severity as keyof typeof severityColors]}>
                    {incident.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Phase</p>
                  <p className="text-lg">{incident.phase || incident.status || 'Detection'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-lg">{format(new Date(incident.updatedAt), 'PPpp')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{incident.description}</p>
              </div>

              {incident.detectionDetails && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Detection Details</p>
                  <p className="text-sm">{incident.detectionDetails}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phase Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Response Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={incident.status === 'detection' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('detection')}
                >
                  Detection
                </Button>
                <Button
                  variant={incident.status === 'containment' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('containment')}
                >
                  Containment
                </Button>
                <Button
                  variant={incident.status === 'eradication' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('eradication')}
                >
                  Eradication
                </Button>
                <Button
                  variant={incident.status === 'recovery' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('recovery')}
                >
                  Recovery
                </Button>
                <Button
                  variant={incident.status === 'post-incident' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('post-incident')}
                >
                  Post-Incident
                </Button>
                <Button
                  variant={incident.status === 'closed' ? 'default' : 'outline'}
                  onClick={() => updateIncidentStatus('closed')}
                >
                  Close Incident
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Incident Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Timeline functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Response Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team management functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Response Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Response actions functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}