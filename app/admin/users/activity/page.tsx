'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  Users,
  LogIn,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  organizationId: number | null;
  organizationName: string | null;
  success: boolean;
  timestamp: string;
}

interface ActivityStats {
  totalLogins: number;
  failedLogins: number;
  activeUsers: number;
  newSignups: number;
  passwordResets: number;
}

interface SecurityAlert {
  type: string;
  message: string;
  count?: number;
  timestamp?: string;
}

const ACTION_LABELS: Record<string, { label: string; variant: string }> = {
  SIGN_IN: { label: 'Sign In', variant: 'success' },
  SIGN_IN_FAILED: { label: 'Failed Sign In', variant: 'destructive' },
  SIGN_OUT: { label: 'Sign Out', variant: 'outline' },
  CREATE_ACCOUNT: { label: 'Account Created', variant: 'info' },
  UPDATE_PROFILE: { label: 'Profile Updated', variant: 'outline' },
  UPDATE_PASSWORD: { label: 'Password Changed', variant: 'warning' },
  RESET_PASSWORD: { label: 'Password Reset', variant: 'warning' },
  VERIFY_EMAIL: { label: 'Email Verified', variant: 'success' },
  DELETE_USER: { label: 'User Deleted', variant: 'destructive' },
  UPDATE_USER: { label: 'User Updated', variant: 'outline' },
  CREATE_TEAM: { label: 'Team Created', variant: 'info' },
  UPDATE_TEAM: { label: 'Team Updated', variant: 'outline' },
  DELETE_TEAM: { label: 'Team Deleted', variant: 'destructive' },
};

export default function UserActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalLogins: 0,
    failedLogins: 0,
    activeUsers: 0,
    newSignups: 0,
    passwordResets: 0,
  });
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [page, actionFilter, dateFrom, dateTo]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/system-admin/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');

      const data = await response.json();
      setActivities(data.activities);
      setStats(data.stats);
      setSecurityAlerts(data.securityAlerts || []);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchActivities();
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast({
      title: 'Export Started',
      description: 'Activity logs are being exported to CSV',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getActionBadge = (action: string, success: boolean) => {
    const config = ACTION_LABELS[action] || { label: action, variant: 'outline' };
    const variant = !success && action !== 'SIGN_IN_FAILED' ? 'destructive' : config.variant;

    return (
      <Badge variant={variant as any} size="sm">
        {config.label}
      </Badge>
    );
  };

  const getIpAddressBadge = (ip: string) => {
    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168');
    return (
      <Badge variant={isLocal ? 'outline' : 'secondary'} size="sm">
        {ip}
      </Badge>
    );
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
            </div>
            <p className="text-gray-600 ml-11">
              Monitor user activities, security events, and system access patterns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <LogIn className="h-5 w-5 text-green-500" />
              <span className="text-xs text-gray-500">24h</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
            <p className="text-sm text-gray-600">Logins</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-xs text-gray-500">24h</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-xs text-gray-500">24h</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.newSignups}</p>
            <p className="text-sm text-gray-600">New Signups</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              <span className="text-xs text-gray-500">7d</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.passwordResets}</p>
            <p className="text-sm text-gray-600">Password Resets</p>
          </div>
        </div>

        {/* Security Alerts */}
        {securityAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {securityAlerts.map((alert, index) => (
              <Alert key={index} className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Security Alert</AlertTitle>
                <AlertDescription className="text-amber-700">
                  {alert.message}
                  {alert.count && ` (${alert.count} occurrences)`}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by user name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchActivities()}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="SIGN_IN">Sign In</SelectItem>
                <SelectItem value="SIGN_IN_FAILED">Failed Sign In</SelectItem>
                <SelectItem value="SIGN_OUT">Sign Out</SelectItem>
                <SelectItem value="CREATE_ACCOUNT">Account Creation</SelectItem>
                <SelectItem value="UPDATE_PASSWORD">Password Changes</SelectItem>
                <SelectItem value="DELETE_USER">User Deletion</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="date"
                className="w-[140px]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-gray-400">to</span>
              <Input
                type="date"
                className="w-[140px]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchActivities}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => {
              const time = formatTimestamp(activity.timestamp);
              return (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{time.relative}</p>
                        <p className="text-xs text-gray-500">
                          {time.date} {time.time}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{activity.userName}</p>
                      <p className="text-sm text-gray-500">{activity.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(activity.action, activity.success)}
                  </TableCell>
                  <TableCell>
                    {activity.organizationName ? (
                      <Badge variant="outline" size="sm">
                        {activity.organizationName}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getIpAddressBadge(activity.ipAddress)}
                  </TableCell>
                  <TableCell>
                    {activity.success ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" size="sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}