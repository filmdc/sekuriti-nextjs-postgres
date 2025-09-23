import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Target,
  Calendar,
  Download,
  ArrowUp,
  ArrowDown,
  Clock,
  Globe,
} from 'lucide-react';

export default async function AnalyticsPage() {
  // Mock data - in production, fetch from analytics service
  const analytics = {
    overview: {
      totalUsers: 1234,
      userGrowth: 12.5,
      activeOrganizations: 89,
      orgGrowth: 8.3,
      revenue: 98760,
      revenueGrowth: 15.2,
      incidents: 342,
      incidentGrowth: -5.8,
    },
    userMetrics: {
      dailyActiveUsers: 456,
      weeklyActiveUsers: 892,
      monthlyActiveUsers: 1123,
      avgSessionDuration: '8m 42s',
      bounceRate: 23.4,
      retentionRate: 87.6,
    },
    topPages: [
      { page: '/dashboard', views: 15234, avgTime: '2m 15s' },
      { page: '/incidents', views: 8923, avgTime: '5m 32s' },
      { page: '/assets', views: 6542, avgTime: '3m 18s' },
      { page: '/runbooks', views: 4321, avgTime: '4m 45s' },
      { page: '/communications', views: 2345, avgTime: '2m 56s' },
    ],
    geographic: [
      { country: 'United States', users: 534, percentage: 43.3 },
      { country: 'United Kingdom', users: 234, percentage: 19.0 },
      { country: 'Canada', users: 156, percentage: 12.7 },
      { country: 'Australia', users: 98, percentage: 7.9 },
      { country: 'Germany', users: 87, percentage: 7.1 },
    ],
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            <p className="text-gray-600">
              Platform usage metrics and business intelligence
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold mt-1">
                {analytics.overview.totalUsers.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {analytics.overview.userGrowth > 0 ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">
                      +{analytics.overview.userGrowth}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600">
                      {analytics.overview.userGrowth}%
                    </span>
                  </>
                )}
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Organizations</p>
              <p className="text-2xl font-bold mt-1">
                {analytics.overview.activeOrganizations}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">
                  +{analytics.overview.orgGrowth}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">
                ${analytics.overview.revenue.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">
                  +{analytics.overview.revenueGrowth}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold mt-1">
                {analytics.overview.incidents}
              </p>
              <div className="flex items-center mt-2">
                <ArrowDown className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">
                  {Math.abs(analytics.overview.incidentGrowth)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Daily Active Users</span>
                    <span className="text-sm font-medium">{analytics.userMetrics.dailyActiveUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(analytics.userMetrics.dailyActiveUsers / analytics.overview.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Weekly Active Users</span>
                    <span className="text-sm font-medium">{analytics.userMetrics.weeklyActiveUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(analytics.userMetrics.weeklyActiveUsers / analytics.overview.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly Active Users</span>
                    <span className="text-sm font-medium">{analytics.userMetrics.monthlyActiveUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(analytics.userMetrics.monthlyActiveUsers / analytics.overview.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Session Metrics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.userMetrics.avgSessionDuration}</p>
                  <p className="text-sm text-gray-600 mt-1">Avg. Session Duration</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.userMetrics.bounceRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">Bounce Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{analytics.userMetrics.retentionRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">Retention Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">3.2</p>
                  <p className="text-sm text-gray-600 mt-1">Pages per Session</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Pages */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Top Pages
            </h2>
            <div className="space-y-3">
              {analytics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{page.page}</p>
                      <p className="text-sm text-gray-600">Avg. time: {page.avgTime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{page.views.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">page views</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Feature Adoption</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Incident Management</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Asset Tracking</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Runbooks</span>
                    <span className="text-sm font-medium">52%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Communications</span>
                    <span className="text-sm font-medium">43%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '43%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">User Segments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Power Users</span>
                  <Badge>234 users</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Regular Users</span>
                  <Badge>567 users</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Occasional Users</span>
                  <Badge>298 users</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm">Inactive Users</span>
                  <Badge variant="secondary">135 users</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Engagement Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Login Frequency</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Feature Usage</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium">+8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Collaboration</span>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium">+23%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm font-medium">-15%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">API Performance</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold">45ms</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold">99.99%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total API Calls</span>
                    <span className="font-medium">1.2M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Failed Requests</span>
                    <span className="font-medium text-red-600">234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate Limited</span>
                    <span className="font-medium text-yellow-600">89</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Error Rates</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">2xx Success</span>
                    <span className="text-sm">98.5%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '98.5%' }} />
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">4xx Client Errors</span>
                    <span className="text-sm">1.2%</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">5xx Server Errors</span>
                    <span className="text-sm">0.3%</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              User Distribution by Country
            </h2>
            <div className="space-y-3">
              {analytics.geographic.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{country.country}</p>
                      <p className="text-sm text-gray-600">{country.users} users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Countries:</span>
                  <span className="font-medium ml-2">42</span>
                </div>
                <div>
                  <span className="text-gray-600">New Countries (30d):</span>
                  <span className="font-medium ml-2">3</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}