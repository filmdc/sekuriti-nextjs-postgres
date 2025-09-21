'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Tag as TagIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Clock
} from 'lucide-react';
import type { Tag } from '@/lib/db/schema-tags';

interface TagPerformanceProps {
  organizationId: number;
  className?: string;
}

interface TagMetrics {
  id: number;
  name: string;
  category: string;
  color: string;
  usageCount: number;
  assetCount: number;
  growthRate: number;
  lastUsed: string;
  efficiency: number;
}

interface TagTrend {
  date: string;
  usage: number;
  newTags: number;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export function TagPerformance({ organizationId, className }: TagPerformanceProps) {
  const [metrics, setMetrics] = useState<TagMetrics[]>([]);
  const [trends, setTrends] = useState<TagTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      try {
        // Fetch tag performance metrics
        const [tagsResponse, trendsResponse] = await Promise.all([
          fetch('/api/tags'),
          fetch(`/api/organization/tags/performance?timeRange=${timeRange}`)
        ]);

        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();

          // Transform tags into metrics
          const tagMetrics: TagMetrics[] = tagsData.map((tag: Tag) => ({
            id: tag.id,
            name: tag.name,
            category: tag.category,
            color: tag.color,
            usageCount: tag.usageCount || 0,
            assetCount: Math.floor((tag.usageCount || 0) * 0.7), // Approximate assets tagged
            growthRate: Math.random() * 40 - 20, // Mock growth rate
            lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            efficiency: Math.min(100, (tag.usageCount || 0) * 10)
          }));

          setMetrics(tagMetrics);
        }

        // Mock trends data for now
        const mockTrends: TagTrend[] = Array.from({ length: parseInt(timeRange) }, (_, i) => ({
          date: new Date(Date.now() - (parseInt(timeRange) - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          usage: Math.floor(Math.random() * 50) + 20,
          newTags: Math.floor(Math.random() * 5)
        }));

        setTrends(mockTrends);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [organizationId, timeRange]);

  // Calculate key metrics
  const totalTags = metrics.length;
  const activeTags = metrics.filter(tag => tag.usageCount > 0).length;
  const dormantTags = totalTags - activeTags;
  const avgUsage = metrics.reduce((sum, tag) => sum + tag.usageCount, 0) / totalTags || 0;
  const topPerformers = metrics.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
  const lowPerformers = metrics.filter(tag => tag.usageCount === 0);

  // Category distribution
  const categoryDistribution = metrics.reduce((acc, tag) => {
    acc[tag.category] = (acc[tag.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryDistribution).map(([category, count], index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
    value: count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header with Time Range Selector */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tag Performance Analytics</h3>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTags}</div>
              <p className="text-xs text-muted-foreground">
                {activeTags} active, {dormantTags} dormant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{((activeTags / totalTags) * 100).toFixed(1)}%</div>
              <Progress value={(activeTags / totalTags) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgUsage.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                per tag
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              {activeTags / totalTags > 0.7 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTags / totalTags > 0.7 ? 'Good' : 'Fair'}
              </div>
              <p className="text-xs text-muted-foreground">
                Tag ecosystem health
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList>
            <TabsTrigger value="trends">Usage Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tag Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Tag Usage"
                    />
                    <Area
                      type="monotone"
                      dataKey="newTags"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                      name="New Tags"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((tag, index) => (
                      <div key={tag.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{tag.usageCount} uses</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topPerformers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="usageCount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Category Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 10 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(categoryDistribution).map(([category, count]) => {
                      const categoryTags = metrics.filter(tag => tag.category === category);
                      const totalUsage = categoryTags.reduce((sum, tag) => sum + tag.usageCount, 0);
                      const avgUsagePerTag = totalUsage / count;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {count} tags, {avgUsagePerTag.toFixed(1)} avg usage
                            </span>
                          </div>
                          <Progress value={(totalUsage / (avgUsage * totalTags)) * 100} />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                    Dormant Tags
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tags with zero usage that might need attention
                  </p>
                </CardHeader>
                <CardContent>
                  {lowPerformers.length > 0 ? (
                    <div className="space-y-2">
                      {lowPerformers.slice(0, 10).map(tag => (
                        <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              Merge
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      {lowPerformers.length > 10 && (
                        <p className="text-xs text-gray-500 pt-2">
                          +{lowPerformers.length - 10} more dormant tags
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">All tags are being used!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recently Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics
                      .filter(tag => tag.usageCount > 0)
                      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                      .slice(0, 8)
                      .map(tag => (
                        <div key={tag.id} className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(tag.lastUsed).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}