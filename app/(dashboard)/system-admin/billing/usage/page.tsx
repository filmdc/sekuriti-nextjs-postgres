import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, Users, Database, Download, AlertCircle, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UsagePage() {
  // Placeholder usage data
  const usageData = [
    {
      id: 1,
      organization: 'Acme Corporation',
      plan: 'Enterprise',
      users: { current: 87, limit: 100 },
      assets: { current: 2456, limit: 'Unlimited' },
      incidents: { current: 45, limit: 'Unlimited' },
      storage: { current: 12.3, limit: 100 },
      api: { current: 234567, limit: 1000000 },
      status: 'normal',
    },
    {
      id: 2,
      organization: 'TechStart Inc',
      plan: 'Professional',
      users: { current: 42, limit: 50 },
      assets: { current: 876, limit: 1000 },
      incidents: { current: 23, limit: 100 },
      storage: { current: 4.7, limit: 20 },
      api: { current: 89234, limit: 100000 },
      status: 'warning',
    },
    {
      id: 3,
      organization: 'Global Systems',
      plan: 'Starter',
      users: { current: 8, limit: 10 },
      assets: { current: 89, limit: 100 },
      incidents: { current: 12, limit: 25 },
      storage: { current: 1.2, limit: 5 },
      api: { current: 4532, limit: 10000 },
      status: 'normal',
    },
  ];

  const getUsagePercentage = (current: number, limit: number | string) => {
    if (limit === 'Unlimited') return 0;
    return Math.round((current / (limit as number)) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor resource consumption and usage patterns across organizations
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Usage analytics functionality will be available soon.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">328,333</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">137</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.2 GB</div>
            <p className="text-xs text-muted-foreground">Of 125 GB total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overage Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground">Organizations at limit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Usage</CardTitle>
              <CardDescription>Resource consumption by organization</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="month">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24h</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>API Calls</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((org) => {
                  const userPercentage = getUsagePercentage(org.users.current, org.users.limit);
                  const storagePercentage = getUsagePercentage(org.storage.current, org.storage.limit);
                  const apiPercentage = getUsagePercentage(org.api.current, org.api.limit);

                  return (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.organization}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {org.users.current}/{org.users.limit}
                          </div>
                          <Progress value={userPercentage} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {org.assets.current}
                          {org.assets.limit !== 'Unlimited' && `/${org.assets.limit}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {org.storage.current} GB/{org.storage.limit} GB
                          </div>
                          <Progress value={storagePercentage} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {org.api.current.toLocaleString()}
                          </div>
                          <Progress value={apiPercentage} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={org.status === 'normal' ? 'default' : 'secondary'}
                          className={org.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                        >
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Resource consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Usage trend chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Consumers</CardTitle>
            <CardDescription>Organizations with highest usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Acme Corporation</span>
                </div>
                <span className="text-sm text-muted-foreground">234,567 API calls</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Global Systems</span>
                </div>
                <span className="text-sm text-muted-foreground">12.3 GB storage</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">TechStart Inc</span>
                </div>
                <span className="text-sm text-muted-foreground">42 active users</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}