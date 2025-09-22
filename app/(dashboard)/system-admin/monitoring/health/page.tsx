import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, CheckCircle, XCircle, AlertTriangle, Server, Database, Globe, HardDrive, Cpu, MemoryStick, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function HealthMonitoringPage() {
  // Placeholder health data
  const systemHealth = {
    overall: 'healthy',
    uptime: '45 days, 3 hours',
    lastCheck: '30 seconds ago',
  };

  const services = [
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '124ms',
      icon: Globe,
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '8ms',
      icon: Database,
    },
    {
      name: 'API Server',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '45ms',
      icon: Server,
    },
    {
      name: 'Background Jobs',
      status: 'degraded',
      uptime: '98.50%',
      responseTime: '2340ms',
      icon: Activity,
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: '99.90%',
      responseTime: '567ms',
      icon: Globe,
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '89ms',
      icon: HardDrive,
    },
  ];

  const recentIncidents = [
    {
      id: 1,
      service: 'Background Jobs',
      issue: 'High queue depth causing delays',
      status: 'investigating',
      started: '10 minutes ago',
      severity: 'medium',
    },
    {
      id: 2,
      service: 'API Server',
      issue: 'Increased response times',
      status: 'resolved',
      started: '2 hours ago',
      resolved: '1 hour ago',
      severity: 'low',
    },
    {
      id: 3,
      service: 'Database',
      issue: 'Connection pool exhaustion',
      status: 'resolved',
      started: 'Yesterday 14:00',
      resolved: 'Yesterday 14:45',
      severity: 'high',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground mt-2">
          Monitor system performance and service availability
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Health monitoring functionality will be available soon.
        </AlertDescription>
      </Alert>

      {/* System Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Current system status and metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-lg font-medium">All Systems Operational</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              {systemHealth.overall}
            </Badge>
            <span className="text-sm text-muted-foreground ml-auto">
              Uptime: {systemHealth.uptime} | Last check: {systemHealth.lastCheck}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <Progress value={42} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">8 cores available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2 GB</div>
                <Progress value={65} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">of 16 GB used</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234 GB</div>
                <Progress value={35} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">of 1 TB used</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Network</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2 Gbps</div>
                <Progress value={24} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">bandwidth usage</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Individual service health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">{service.name}</h4>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-medium ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span>{service.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response</span>
                      <span>{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Service disruptions and issues</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">{incident.service}</TableCell>
                    <TableCell>{incident.issue}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          incident.severity === 'high'
                            ? 'text-red-600'
                            : incident.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.started}</TableCell>
                    <TableCell>
                      <Badge
                        variant={incident.status === 'resolved' ? 'secondary' : 'default'}
                        className={
                          incident.status === 'investigating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : incident.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : ''
                        }
                      >
                        {incident.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}