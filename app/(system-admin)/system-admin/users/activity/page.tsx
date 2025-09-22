'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Key,
  Shield,
  UserPlus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface UserActivity {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  organizationId: number;
  organizationName: string;
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

export default function UserActivityPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    totalLogins: 0,
    failedLogins: 0,
    activeUsers: 0,
    newSignups: 0,
    passwordResets: 0,
  });
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    status: 'all',
    organization: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchActivityData();
  }, [currentPage, filters]);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        search: filters.search,
        action: filters.action !== 'all' ? filters.action : '',
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      const response = await fetch(`/api/system-admin/activity?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity data');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setStats(data.stats || {
        totalLogins: 0,
        failedLogins: 0,
        activeUsers: 0,
        newSignups: 0,
        passwordResets: 0,
      });
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
      setSecurityAlerts(data.securityAlerts || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SIGN_IN':
        return <LogIn className="h-4 w-4" />;
      case 'SIGN_OUT':
        return <LogOut className="h-4 w-4" />;
      case 'UPDATE_PASSWORD':
        return <Key className="h-4 w-4" />;
      case 'CREATE_ACCOUNT':
        return <UserPlus className="h-4 w-4" />;
      case 'IMPERSONATE_USER':
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'bg-red-100 text-red-800';
    switch (action) {
      case 'SIGN_IN':
      case 'SIGN_OUT':
        return 'bg-blue-100 text-blue-800';
      case 'UPDATE_PASSWORD':
      case 'RESET_PASSWORD':
        return 'bg-yellow-100 text-yellow-800';
      case 'CREATE_ACCOUNT':
        return 'bg-green-100 text-green-800';
      case 'IMPERSONATE_USER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const exportActivities = () => {
    const csv = [
      ['Timestamp', 'User', 'Email', 'Action', 'Organization', 'Status', 'IP Address'],
      ...activities.map(activity => [
        activity.timestamp,
        activity.userName,
        activity.userEmail,
        activity.action,
        activity.organizationName,
        activity.success ? 'Success' : 'Failed',
        activity.ipAddress,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Activity</h2>
          <p className="text-muted-foreground">
            Monitor user actions and authentication events
          </p>
        </div>
        <Button onClick={exportActivities}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.failedLogins / stats.totalLogins) * 100)}% failure rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newSignups}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Password Resets</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passwordResets}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            <Select value={filters.action} onValueChange={(value) => handleFilterChange({ ...filters, action: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="SIGN_IN">Sign In</SelectItem>
                <SelectItem value="SIGN_OUT">Sign Out</SelectItem>
                <SelectItem value="UPDATE_PASSWORD">Update Password</SelectItem>
                <SelectItem value="CREATE_ACCOUNT">Create Account</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange({ ...filters, dateFrom: e.target.value })}
              placeholder="From Date"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange({ ...filters, dateTo: e.target.value })}
              placeholder="To Date"
            />
            <Button
              variant="outline"
              onClick={() =>
                handleFilterChange({
                  search: '',
                  action: 'all',
                  status: 'all',
                  organization: 'all',
                  dateFrom: '',
                  dateTo: '',
                })
              }
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Activity Table */}
      {!loading && (
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent user authentication and account activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{activity.userName}</p>
                      <p className="text-xs text-muted-foreground">{activity.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(activity.action, activity.success)}>
                      {getActionIcon(activity.action)}
                      <span className="ml-1">{activity.action.replace(/_/g, ' ')}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.organizationName}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{activity.ipAddress}</span>
                  </TableCell>
                  <TableCell>
                    {activity.success ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{activity.userAgent}</span>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No activity found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            {securityAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Badge variant={alert.type === 'failed_logins' ? 'destructive' : 'outline'}>
                  {alert.count ? `${alert.count} attempts` : 'Review'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}