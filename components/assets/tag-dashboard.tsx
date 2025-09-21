'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Tag as TagIcon,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import type { Tag } from '@/lib/db/schema-tags';

interface TagDashboardProps {
  tags: Tag[];
  className?: string;
}

interface TagStatistics {
  total: number;
  totalTaggings: number;
  byCategory: Array<{ category: string; count: number }>;
}

interface TagUsageData {
  name: string;
  usage: number;
  color: string;
  category: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff'];

export function TagDashboard({ tags, className }: TagDashboardProps) {
  const [statistics, setStatistics] = useState<TagStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/organization/tags/statistics');
        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
        }
      } catch (error) {
        console.error('Error fetching tag statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Prepare data for charts
  const topTags = tags
    .filter(tag => tag.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map(tag => ({
      name: tag.name,
      usage: tag.usageCount,
      color: tag.color,
      category: tag.category
    }));

  const categoryData = statistics?.byCategory.map((cat, index) => ({
    name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace('_', ' '),
    value: cat.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const unusedTags = tags.filter(tag => tag.usageCount === 0);
  const tagUsageRate = tags.length > 0 ? ((tags.length - unusedTags.length) / tags.length) * 100 : 0;

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
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {categoryData.length} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalTaggings || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all assets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tagUsageRate.toFixed(1)}%</div>
              <Progress value={tagUsageRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unused Tags</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unusedTags.length}</div>
              <p className="text-xs text-muted-foreground">
                Consider removing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Tags Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Used Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTags.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topTags}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} uses`,
                        `${props.payload.name} (${props.payload.category})`
                      ]}
                    />
                    <Bar dataKey="usage" fill={(entry: TagUsageData) => entry.color} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No tag usage data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Tags by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Unused Tags */}
        {unusedTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Unused Tags</CardTitle>
              <p className="text-sm text-muted-foreground">
                These tags are not assigned to any assets and might need attention.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unusedTags.slice(0, 20).map(tag => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-sm"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {unusedTags.length > 20 && (
                  <Badge variant="outline">
                    +{unusedTags.length - 20} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}