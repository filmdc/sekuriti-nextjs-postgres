import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default async function SystemHealthPage() {
  // Mock data - in production, fetch from monitoring service
  const systemMetrics = {
    status: 'healthy',
    uptime: '45 days, 3 hours',
    lastCheck: new Date().toISOString(),
    services: [
      { name: 'Web Server', status: 'healthy', responseTime: 45 },
      { name: 'Database', status: 'healthy', responseTime: 12 },
      { name: 'Cache', status: 'healthy', responseTime: 3 },
      { name: 'Queue', status: 'warning', responseTime: 234 },
      { name: 'Storage', status: 'healthy', responseTime: 56 },
      { name: 'Email Service', status: 'healthy', responseTime: 120 },
    ],
    resources: {
      cpu: 45,
      memory: 62,
      disk: 24,
      network: 15,
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-8 w-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            </div>
            <p className="text-gray-600">
              Monitor system performance and service availability
            </p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getStatusIcon(systemMetrics.status)}
            <div>
              <h2 className="text-xl font-semibold">System Status</h2>
              <p className={`text-sm ${getStatusColor(systemMetrics.status)}`}>
                All systems operational
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-lg font-semibold">{systemMetrics.uptime}</p>
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </h2>
          <div className="space-y-3">
            {systemMetrics.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      Response: {service.responseTime}ms
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    service.status === 'healthy'
                      ? 'default'
                      : service.status === 'warning'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Resource Usage
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-600">{systemMetrics.resources.cpu}%</span>
              </div>
              <Progress value={systemMetrics.resources.cpu} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-600">{systemMetrics.resources.memory}%</span>
              </div>
              <Progress value={systemMetrics.resources.memory} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-gray-600">{systemMetrics.resources.disk}%</span>
              </div>
              <Progress value={systemMetrics.resources.disk} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Network I/O</span>
                <span className="text-sm text-gray-600">{systemMetrics.resources.network}%</span>
              </div>
              <Progress value={systemMetrics.resources.network} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">CPU Cores</p>
          <p className="text-2xl font-bold">8 cores</p>
          <p className="text-xs text-gray-500 mt-1">3.6 GHz average</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <MemoryStick className="h-5 w-5 text-purple-600" />
            <TrendingDown className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Memory</p>
          <p className="text-2xl font-bold">19.8 / 32 GB</p>
          <p className="text-xs text-gray-500 mt-1">62% utilized</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="h-5 w-5 text-green-600" />
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600">Storage</p>
          <p className="text-2xl font-bold">2.4 / 10 TB</p>
          <p className="text-xs text-gray-500 mt-1">24% utilized</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Wifi className="h-5 w-5 text-orange-600" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Bandwidth</p>
          <p className="text-2xl font-bold">1.2 Gbps</p>
          <p className="text-xs text-gray-500 mt-1">15% utilized</p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Metrics (Last 24 Hours)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Response Times</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average</span>
                <span className="font-medium">45ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>P50</span>
                <span className="font-medium">38ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>P95</span>
                <span className="font-medium">92ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>P99</span>
                <span className="font-medium">156ms</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Request Volume</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Requests</span>
                <span className="font-medium">1.2M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium text-green-600">99.98%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium text-red-600">0.02%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Peak RPS</span>
                <span className="font-medium">842</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Database Performance</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Connections</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Query Time (avg)</span>
                <span className="font-medium">2.3ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Slow Queries</span>
                <span className="font-medium text-yellow-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cache Hit Rate</span>
                <span className="font-medium">94%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Incidents */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent System Events
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm">High memory usage detected</p>
                <p className="text-sm text-gray-600">Memory usage exceeded 80% threshold</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">2 hours ago</p>
              <Badge variant="secondary">Resolved</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Database backup completed</p>
                <p className="text-sm text-gray-600">Daily backup finished successfully</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">6 hours ago</p>
              <Badge className="bg-green-100 text-green-800">Success</Badge>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">System maintenance completed</p>
                <p className="text-sm text-gray-600">Security patches applied</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">1 day ago</p>
              <Badge>Completed</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}