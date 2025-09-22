'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Download, TrendingUp, Users, Activity, Database, AlertTriangle } from 'lucide-react'

const mockUsageData = [
  {
    id: 1,
    organization: 'Acme Corp',
    plan: 'Professional',
    users: { current: 42, limit: 50 },
    assets: { current: 856, limit: 1000 },
    storage: { current: 12.5, limit: 50 },
    apiCalls: { current: 45230, limit: 100000 },
    incidents: 28,
    status: 'normal',
  },
  {
    id: 2,
    organization: 'TechStart Inc',
    plan: 'Starter',
    users: { current: 8, limit: 10 },
    assets: { current: 95, limit: 100 },
    storage: { current: 2.1, limit: 10 },
    apiCalls: { current: 12450, limit: 50000 },
    incidents: 5,
    status: 'warning',
  },
  {
    id: 3,
    organization: 'Global Systems',
    plan: 'Enterprise',
    users: { current: 156, limit: -1 },
    assets: { current: 3421, limit: -1 },
    storage: { current: 78.3, limit: 500 },
    apiCalls: { current: 234560, limit: -1 },
    incidents: 142,
    status: 'normal',
  },
]

const mockTrends = [
  { month: 'Jan', users: 1250, assets: 42300, apiCalls: 2.1 },
  { month: 'Feb', users: 1380, assets: 45600, apiCalls: 2.4 },
  { month: 'Mar', users: 1420, assets: 48900, apiCalls: 2.8 },
  { month: 'Apr', users: 1560, assets: 52100, apiCalls: 3.2 },
  { month: 'May', users: 1680, assets: 56800, apiCalls: 3.6 },
  { month: 'Jun', users: 1820, assets: 61200, apiCalls: 3.9 },
]

export default function UsageReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Usage Reports</h1>
          <p className="text-muted-foreground mt-2">
            Monitor platform usage and resource consumption
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
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
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,820</div>
            <p className="text-xs text-muted-foreground">+140 from last month</p>
            <Progress value={72} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">61,200</div>
            <p className="text-xs text-muted-foreground">+4,400 from last month</p>
            <Progress value={61} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.9M</div>
            <p className="text-xs text-muted-foreground">+300K from last month</p>
            <Progress value={39} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1 TB</div>
            <p className="text-xs text-muted-foreground">+180 GB from last month</p>
            <Progress value={42} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">By Organization</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Usage Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Usage</CardTitle>
              <CardDescription>
                Detailed usage metrics by organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>API Calls</TableHead>
                    <TableHead>Incidents</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsageData.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.organization}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{org.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        {org.users.limit === -1 ? (
                          <span>{org.users.current}</span>
                        ) : (
                          <div>
                            <span>{org.users.current}/{org.users.limit}</span>
                            <Progress 
                              value={(org.users.current / org.users.limit) * 100} 
                              className="mt-1 h-1"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {org.assets.limit === -1 ? (
                          <span>{org.assets.current}</span>
                        ) : (
                          <div>
                            <span>{org.assets.current}/{org.assets.limit}</span>
                            <Progress 
                              value={(org.assets.current / org.assets.limit) * 100} 
                              className="mt-1 h-1"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{org.storage.current} GB</TableCell>
                      <TableCell>{(org.apiCalls.current / 1000).toFixed(1)}K</TableCell>
                      <TableCell>{org.incidents}</TableCell>
                      <TableCell>
                        {org.status === 'warning' ? (
                          <Badge variant="outline" className="text-yellow-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
                <CardDescription>Usage breakdown by resource type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compute Resources</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <Progress value={42} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Bandwidth</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Progress value={35} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Quota</span>
                    <span className="font-medium">52%</span>
                  </div>
                  <Progress value={52} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Resource Consumers</CardTitle>
                <CardDescription>Organizations with highest usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Global Systems', usage: 34, trend: '+12%' },
                    { name: 'Acme Corp', usage: 28, trend: '+8%' },
                    { name: 'SecureNet Ltd', usage: 15, trend: '+5%' },
                    { name: 'DataGuard Inc', usage: 12, trend: '-2%' },
                    { name: 'TechStart Inc', usage: 11, trend: '+18%' },
                  ].map((org) => (
                    <div key={org.name} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{org.name}</p>
                        <Progress value={org.usage} className="h-2 w-32" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{org.usage}%</p>
                        <p className="text-xs text-muted-foreground">{org.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Platform usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 text-sm">
                  <div className="grid grid-cols-7 gap-4 font-medium">
                    <div>Month</div>
                    {mockTrends.map((item) => (
                      <div key={item.month}>{item.month}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    <div>Users</div>
                    {mockTrends.map((item) => (
                      <div key={item.month}>{item.users.toLocaleString()}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    <div>Assets</div>
                    {mockTrends.map((item) => (
                      <div key={item.month}>{item.assets.toLocaleString()}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    <div>API (M)</div>
                    {mockTrends.map((item) => (
                      <div key={item.month}>{item.apiCalls}</div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Average growth: +8.3% per month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Alerts</CardTitle>
              <CardDescription>
                Organizations approaching or exceeding limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    org: 'TechStart Inc',
                    alert: 'Approaching user limit',
                    details: '8 of 10 users (80%)',
                    severity: 'warning',
                  },
                  {
                    org: 'TechStart Inc',
                    alert: 'Near asset limit',
                    details: '95 of 100 assets (95%)',
                    severity: 'critical',
                  },
                  {
                    org: 'DataFlow Systems',
                    alert: 'High API usage',
                    details: '85% of monthly quota used',
                    severity: 'warning',
                  },
                  {
                    org: 'SecureVault Pro',
                    alert: 'Storage warning',
                    details: '45 GB of 50 GB used (90%)',
                    severity: 'critical',
                  },
                ].map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle 
                        className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-sm">{alert.org}</p>
                        <p className="text-sm text-muted-foreground">{alert.alert}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{alert.details}</p>
                      <Badge 
                        variant="outline" 
                        className={alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}