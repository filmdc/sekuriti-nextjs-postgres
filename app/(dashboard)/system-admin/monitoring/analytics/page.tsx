import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Users, FileText, Shield, Activity, BarChart3, PieChart, Download, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AnalyticsPage() {
  // Placeholder analytics data
  const metrics = {
    totalIncidents: { value: 234, change: 12, trend: 'up' },
    avgResponseTime: { value: '4.2h', change: -15, trend: 'down' },
    activeUsers: { value: 1847, change: 8, trend: 'up' },
    systemUptime: { value: '99.95%', change: 0.02, trend: 'up' },
  };

  const topOrganizations = [
    { name: 'Acme Corporation', incidents: 45, assets: 2345, users: 87 },
    { name: 'TechStart Inc', incidents: 32, assets: 876, users: 42 },
    { name: 'Global Systems', incidents: 28, assets: 1234, users: 65 },
    { name: 'SecureNet Pro', incidents: 19, assets: 567, users: 23 },
    { name: 'DataGuard Solutions', incidents: 15, assets: 432, users: 18 },
  ];

  const incidentTrends = [
    { month: 'Jul', count: 145, resolved: 142 },
    { month: 'Aug', count: 178, resolved: 175 },
    { month: 'Sep', count: 156, resolved: 154 },
    { month: 'Oct', count: 234, resolved: 220 },
  ];

  const severityDistribution = [
    { severity: 'Critical', count: 12, percentage: 5 },
    { severity: 'High', count: 48, percentage: 21 },
    { severity: 'Medium', count: 98, percentage: 42 },
    { severity: 'Low', count: 76, percentage: 32 },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System-wide analytics and performance metrics
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Analytics functionality will be available soon.
        </AlertDescription>
      </Alert>

      {/* Date Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalIncidents.value}</div>
            <div className="flex items-center gap-1 text-sm">
              {metrics.totalIncidents.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <span className={metrics.totalIncidents.trend === 'up' ? 'text-red-600' : 'text-green-600'}>
                {Math.abs(metrics.totalIncidents.change)}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime.value}</div>
            <div className="flex items-center gap-1 text-sm">
              {metrics.avgResponseTime.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <span className={metrics.avgResponseTime.trend === 'down' ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.avgResponseTime.change)}%
              </span>
              <span className="text-muted-foreground">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.value.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm">
              {metrics.activeUsers.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={metrics.activeUsers.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(metrics.activeUsers.change)}%
              </span>
              <span className="text-muted-foreground">growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemUptime.value}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+{metrics.systemUptime.change}%</span>
              <span className="text-muted-foreground">reliability</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
                <CardDescription>Monthly incident count and resolution rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Incident trend chart will be displayed here</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {incidentTrends.map((month) => (
                    <div key={month.month} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <div className="flex gap-4">
                        <span>Total: {month.count}</span>
                        <span className="text-green-600">Resolved: {month.resolved}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Incidents by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Severity distribution chart will be displayed here</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {severityDistribution.map((item) => (
                    <div key={item.severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.severity === 'Critical'
                              ? 'bg-red-500'
                              : item.severity === 'High'
                              ? 'bg-orange-500'
                              : item.severity === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="text-sm font-medium">{item.severity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.count}</span>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Organizations</CardTitle>
              <CardDescription>Most active organizations by usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead className="text-center">Incidents</TableHead>
                      <TableHead className="text-center">Assets</TableHead>
                      <TableHead className="text-center">Users</TableHead>
                      <TableHead className="text-center">Activity Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topOrganizations.map((org, index) => (
                      <TableRow key={org.name}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{index + 1}</span>
                            {org.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{org.incidents}</TableCell>
                        <TableCell className="text-center">{org.assets.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{org.users}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {Math.round((org.incidents * 10 + org.assets * 0.1 + org.users * 5) / 10)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Analytics</CardTitle>
              <CardDescription>Detailed incident metrics and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mean Time to Detect</p>
                  <p className="text-2xl font-bold">2.3h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mean Time to Respond</p>
                  <p className="text-2xl font-bold">4.2h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mean Time to Resolve</p>
                  <p className="text-2xl font-bold">18.5h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>User engagement and activity metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Daily Active Users</p>
                  <p className="text-2xl font-bold">523</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Weekly Active Users</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                  <p className="text-2xl font-bold">24m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">User Retention</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance and reliability indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">124ms</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">0.02%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Throughput</p>
                  <p className="text-2xl font-bold">1.2K/s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}