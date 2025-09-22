'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Database,
  Globe,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastChecked: string;
}

export default function SystemHealthPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const [metrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', trend: 'stable' },
    { name: 'Memory Usage', value: 72, unit: '%', status: 'warning', trend: 'up' },
    { name: 'Disk Space', value: 38, unit: '%', status: 'healthy', trend: 'up' },
    { name: 'Network I/O', value: 125, unit: 'MB/s', status: 'healthy', trend: 'down' },
  ]);

  const [services] = useState<ServiceStatus[]>([
    {
      name: 'Web Server',
      status: 'operational',
      responseTime: 45,
      uptime: 99.99,
      lastChecked: '2 minutes ago',
    },
    {
      name: 'Database',
      status: 'operational',
      responseTime: 12,
      uptime: 99.95,
      lastChecked: '2 minutes ago',
    },
    {
      name: 'Cache (Redis)',
      status: 'operational',
      responseTime: 2,
      uptime: 100,
      lastChecked: '2 minutes ago',
    },
    {
      name: 'Queue Service',
      status: 'degraded',
      responseTime: 180,
      uptime: 98.5,
      lastChecked: '2 minutes ago',
    },
    {
      name: 'Email Service',
      status: 'operational',
      responseTime: 250,
      uptime: 99.9,
      lastChecked: '2 minutes ago',
    },
    {
      name: 'Storage (S3)',
      status: 'operational',
      responseTime: 95,
      uptime: 99.999,
      lastChecked: '2 minutes ago',
    },
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="outline" className="text-green-600">Operational</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="text-yellow-600">Degraded</Badge>;
      case 'down':
        return <Badge variant="outline" className="text-red-600">Down</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">
            Monitor platform performance and service status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">All Systems Operational</p>
                <p className="text-sm text-muted-foreground">
                  No major issues detected
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {metric.name}
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </span>
                  {getStatusIcon(metric.status)}
                </div>
                {metric.unit === '%' && (
                  <Progress
                    value={metric.value}
                    className={`h-2 ${
                      metric.status === 'warning'
                        ? '[&>div]:bg-yellow-600'
                        : metric.status === 'critical'
                        ? '[&>div]:bg-red-600'
                        : ''
                    }`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Real-time status of platform services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {service.lastChecked}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="font-medium">{service.responseTime}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">{service.uptime}%</p>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>
            System issues and alerts from the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Queue Service - High Latency</AlertTitle>
              <AlertDescription>
                <p>Queue processing is experiencing delays. Average processing time: 180ms</p>
                <p className="text-xs mt-1">2 hours ago</p>
              </AlertDescription>
            </Alert>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Scheduled Maintenance</AlertTitle>
              <AlertDescription>
                <p>Database maintenance scheduled for Sunday 2:00 AM - 4:00 AM UTC</p>
                <p className="text-xs mt-1">Scheduled</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Server OS</span>
                <span className="text-sm font-medium">Ubuntu 22.04 LTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Node Version</span>
                <span className="text-sm font-medium">v20.11.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium">PostgreSQL 15.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Redis Version</span>
                <span className="text-sm font-medium">7.0.11</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Memory</span>
                <span className="text-sm font-medium">32 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">CPU Cores</span>
                <span className="text-sm font-medium">8 cores</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Disk Space</span>
                <span className="text-sm font-medium">500 GB SSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Region</span>
                <span className="text-sm font-medium">us-east-1</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}