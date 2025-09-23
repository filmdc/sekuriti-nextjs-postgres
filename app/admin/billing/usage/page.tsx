'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Users,
  Database,
  Zap,
  HardDrive,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  ChevronRight,
  Clock,
  Shield,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface UsageMetrics {
  organizationId: string;
  organizationName: string;
  plan: string;
  billing: {
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate: string;
  };
  users: {
    current: number;
    limit: number | 'unlimited';
    trend: number; // percentage change
  };
  incidents: {
    current: number;
    limit: number | 'unlimited';
    trend: number;
  };
  assets: {
    current: number;
    limit: number | 'unlimited';
    trend: number;
  };
  storage: {
    current: number; // in GB
    limit: number;
    trend: number;
  };
  apiCalls: {
    current: number;
    limit: number | 'unlimited';
    trend: number;
  };
  activities: {
    total: number;
    byType: { type: string; count: number }[];
  };
}

interface UsageHistory {
  date: string;
  users: number;
  incidents: number;
  assets: number;
  storage: number;
  apiCalls: number;
}

interface OrganizationUsage {
  id: string;
  name: string;
  plan: string;
  users: { current: number; limit: number | 'unlimited'; percentage: number };
  incidents: { current: number; limit: number | 'unlimited'; percentage: number };
  storage: { current: number; limit: number; percentage: number };
  apiCalls: { current: number; limit: number | 'unlimited'; percentage: number };
  status: 'normal' | 'warning' | 'critical';
  lastActivity: string;
}

export default function UsagePage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationUsage[]>([]);
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock data for demonstration
    const mockHistory: UsageHistory[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 80,
        incidents: Math.floor(Math.random() * 50) + 100,
        assets: Math.floor(Math.random() * 100) + 400,
        storage: parseFloat((Math.random() * 5 + 20).toFixed(1)),
        apiCalls: Math.floor(Math.random() * 5000) + 10000,
      };
    });

    const mockOrganizations: OrganizationUsage[] = [
      {
        id: 'org_001',
        name: 'TechCorp Solutions',
        plan: 'Enterprise',
        users: { current: 87, limit: 100, percentage: 87 },
        incidents: { current: 234, limit: 'unlimited', percentage: 0 },
        storage: { current: 124, limit: 500, percentage: 24.8 },
        apiCalls: { current: 45000, limit: 'unlimited', percentage: 0 },
        status: 'warning',
        lastActivity: '2 hours ago',
      },
      {
        id: 'org_002',
        name: 'DataSec Industries',
        plan: 'Professional',
        users: { current: 15, limit: 20, percentage: 75 },
        incidents: { current: 89, limit: 'unlimited', percentage: 0 },
        storage: { current: 28, limit: 50, percentage: 56 },
        apiCalls: { current: 18500, limit: 50000, percentage: 37 },
        status: 'normal',
        lastActivity: '5 minutes ago',
      },
      {
        id: 'org_003',
        name: 'CloudGuard Inc',
        plan: 'Starter',
        users: { current: 5, limit: 5, percentage: 100 },
        incidents: { current: 9, limit: 10, percentage: 90 },
        storage: { current: 4.8, limit: 5, percentage: 96 },
        apiCalls: { current: 950, limit: 1000, percentage: 95 },
        status: 'critical',
        lastActivity: '1 hour ago',
      },
    ];

    const mockMetrics: UsageMetrics = {
      organizationId: 'org_001',
      organizationName: 'TechCorp Solutions',
      plan: 'Enterprise',
      billing: {
        currentPeriodStart: '2024-06-01',
        currentPeriodEnd: '2024-06-30',
        nextBillingDate: '2024-07-01',
      },
      users: {
        current: 87,
        limit: 100,
        trend: 12.5,
      },
      incidents: {
        current: 234,
        limit: 'unlimited',
        trend: -5.2,
      },
      assets: {
        current: 456,
        limit: 'unlimited',
        trend: 8.3,
      },
      storage: {
        current: 124,
        limit: 500,
        trend: 15.7,
      },
      apiCalls: {
        current: 45000,
        limit: 'unlimited',
        trend: 23.4,
      },
      activities: {
        total: 1234,
        byType: [
          { type: 'Incidents Created', count: 234 },
          { type: 'Assets Added', count: 156 },
          { type: 'Runbooks Executed', count: 89 },
          { type: 'Reports Generated', count: 45 },
          { type: 'API Calls', count: 710 },
        ],
      },
    };

    setTimeout(() => {
      setUsageHistory(mockHistory);
      setOrganizations(mockOrganizations);
      setUsageMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, [selectedOrgId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage Reports</h1>
          <p className="text-gray-500 mt-1">
            Monitor resource consumption and usage patterns
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">By Organization</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Usage Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-xl font-bold">287</p>
                    <p className="text-xs text-green-600">+12.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Incidents</p>
                    <p className="text-xl font-bold">523</p>
                    <p className="text-xs text-red-600">-5.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Assets</p>
                    <p className="text-xl font-bold">1,234</p>
                    <p className="text-xs text-green-600">+8.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Storage</p>
                    <p className="text-xl font-bold">156 GB</p>
                    <p className="text-xs text-yellow-600">+15.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">API Calls</p>
                    <p className="text-xl font-bold">125K</p>
                    <p className="text-xs text-green-600">+23.4%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Trend</CardTitle>
                <CardDescription>Daily usage over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="incidents" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="assets" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>API calls per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="apiCalls" stroke="#f97316" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>Resource usage by activity type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageMetrics?.activities.byType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Usage</CardTitle>
              <CardDescription>Resource consumption by organization</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>API Calls</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-gray-500">{org.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${getUsageColor(org.users.percentage)}`}>
                            {org.users.current} / {org.users.limit === 'unlimited' ? '∞' : org.users.limit}
                          </p>
                          {org.users.limit !== 'unlimited' && (
                            <Progress
                              value={org.users.percentage}
                              className={`h-1 mt-1 ${getProgressColor(org.users.percentage)}`}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${getUsageColor(org.incidents.percentage)}`}>
                            {org.incidents.current} {org.incidents.limit !== 'unlimited' && `/ ${org.incidents.limit}`}
                          </p>
                          {org.incidents.limit !== 'unlimited' && (
                            <Progress
                              value={org.incidents.percentage}
                              className={`h-1 mt-1 ${getProgressColor(org.incidents.percentage)}`}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${getUsageColor(org.storage.percentage)}`}>
                            {org.storage.current} / {org.storage.limit} GB
                          </p>
                          <Progress
                            value={org.storage.percentage}
                            className={`h-1 mt-1 ${getProgressColor(org.storage.percentage)}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${getUsageColor(org.apiCalls.percentage)}`}>
                            {formatNumber(org.apiCalls.current)}
                          </p>
                          {org.apiCalls.limit !== 'unlimited' && (
                            <>
                              <p className="text-xs text-gray-500">/ {formatNumber(org.apiCalls.limit)}</p>
                              <Progress
                                value={org.apiCalls.percentage}
                                className={`h-1 mt-1 ${getProgressColor(org.apiCalls.percentage)}`}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(org.status)}
                          <span className="text-sm capitalize">{org.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {org.lastActivity}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Consumers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Storage Consumers</CardTitle>
                <CardDescription>Organizations using the most storage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations
                    .sort((a, b) => b.storage.current - a.storage.current)
                    .slice(0, 5)
                    .map((org, index) => (
                      <div key={org.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-gray-500">{org.plan}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{org.storage.current} GB</p>
                          <p className="text-xs text-gray-500">{org.storage.percentage}% of limit</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top API Consumers</CardTitle>
                <CardDescription>Organizations with highest API usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organizations
                    .sort((a, b) => b.apiCalls.current - a.apiCalls.current)
                    .slice(0, 5)
                    .map((org, index) => (
                      <div key={org.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-gray-500">{org.plan}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(org.apiCalls.current)}</p>
                          <p className="text-xs text-gray-500">API calls</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage Trend</CardTitle>
              <CardDescription>Storage consumption over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={usageHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="storage" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Month-over-month growth rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">User Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Incident Volume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      <span className="font-semibold text-red-600">-5.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Storage Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-600">+15.7%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">API Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-600">+23.4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Predictions</CardTitle>
                <CardDescription>Projected usage for next billing period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-gray-500">Projected: 180 GB</span>
                    </div>
                    <Progress value={36} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">36% of 500 GB limit</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-sm text-gray-500">Projected: 58K</span>
                    </div>
                    <Progress value={58} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">58% of 100K limit</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Users</span>
                      <span className="text-sm text-gray-500">Projected: 95</span>
                    </div>
                    <Progress value={95} className="h-2 bg-yellow-600" />
                    <p className="text-xs text-yellow-600 mt-1">95% of 100 limit - Upgrade recommended</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Alerts</CardTitle>
              <CardDescription>Organizations approaching or exceeding limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900">CloudGuard Inc - Critical Usage</p>
                          <p className="text-sm text-red-700 mt-1">
                            Multiple resources approaching limits
                          </p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-500">Users</p>
                          <p className="text-sm font-semibold text-red-600">5/5 (100%)</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-500">Incidents</p>
                          <p className="text-sm font-semibold text-yellow-600">9/10 (90%)</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-500">Storage</p>
                          <p className="text-sm font-semibold text-red-600">4.8/5 GB (96%)</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-500">API Calls</p>
                          <p className="text-sm font-semibold text-red-600">950/1000 (95%)</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          Contact Organization
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-yellow-900">TechCorp Solutions - High Usage</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            User limit approaching capacity
                          </p>
                        </div>
                        <Badge variant="secondary">Warning</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white p-2 rounded">
                          <p className="text-xs text-gray-500">Users</p>
                          <p className="text-sm font-semibold text-yellow-600">87/100 (87%)</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Send Notification</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
              <CardDescription>Configure usage alert thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Warning Threshold</p>
                    <p className="text-sm text-gray-500">Send alert when usage reaches this level</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="70" className="w-20" />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Critical Threshold</p>
                    <p className="text-sm text-gray-500">Escalate alert when usage reaches this level</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="90" className="w-20" />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-notify Organizations</p>
                    <p className="text-sm text-gray-500">Automatically send usage alerts to organizations</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Save Alert Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}