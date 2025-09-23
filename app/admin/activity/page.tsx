'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Shield,
  Settings,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAdminAPI } from '@/lib/hooks/use-admin-api';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  userId?: number;
  userName?: string;
  userEmail?: string;
  teamId?: number;
  teamName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [page, setPage] = useState(1);

  // Build query params
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: '50',
    ...(searchQuery && { search: searchQuery }),
    ...(typeFilter !== 'all' && { type: typeFilter }),
    ...(severityFilter !== 'all' && { severity: severityFilter }),
    ...(dateRange && { range: dateRange }),
  });

  const {
    data,
    isLoading,
    mutate: refreshLogs
  } = useAdminAPI<{
    activities: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }>(`/api/system-admin/activity?${queryParams.toString()}`);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/system-admin/activity/export?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'secondary',
      info: 'outline',
    };

    return (
      <Badge variant={variants[severity] || 'outline'} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'team':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600 mt-2">
              System-wide audit trail and activity monitoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => refreshLogs()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user, action, or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="auth">Authentication</SelectItem>
              <SelectItem value="user">User Management</SelectItem>
              <SelectItem value="team">Team Actions</SelectItem>
              <SelectItem value="incident">Incidents</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20" /> : (data?.total || 0)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Events</p>
              <p className="text-2xl font-bold text-red-600">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  data?.activities?.filter(a => a.severity === 'critical').length || 0
                )}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  new Set(data?.activities?.map(a => a.userId).filter(Boolean)).size || 0
                )}
              </p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Affected Teams</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  new Set(data?.activities?.map(a => a.teamId).filter(Boolean)).size || 0
                )}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : data?.activities?.length ? (
              data.activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(activity.type)}
                      <span className="capitalize">{activity.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{activity.action}</p>
                  </TableCell>
                  <TableCell>
                    {activity.userName ? (
                      <div>
                        <p className="text-sm font-medium">{activity.userName}</p>
                        <p className="text-xs text-gray-500">{activity.userEmail}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {activity.teamName || '-'}
                  </TableCell>
                  <TableCell>
                    <div>
                      {activity.ipAddress && (
                        <p className="text-xs text-gray-600">IP: {activity.ipAddress}</p>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600">View details</summary>
                          <pre className="mt-1 p-1 bg-gray-50 rounded text-xs overflow-auto max-w-xs">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(activity.severity)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.total)} of {data.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.totalPages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}