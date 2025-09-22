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
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<UserActivity[]>([
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john@example.com',
      action: 'SIGN_IN',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0',
      organizationId: 1,
      organizationName: 'Acme Corp',
      success: true,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      userId: 2,
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      action: 'UPDATE_PASSWORD',
      ipAddress: '192.168.1.2',
      userAgent: 'Safari/17.0',
      organizationId: 1,
      organizationName: 'Acme Corp',
      success: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      userId: 3,
      userName: 'Bob Wilson',
      userEmail: 'bob@example.com',
      action: 'SIGN_IN',
      ipAddress: '192.168.1.3',
      userAgent: 'Firefox/120.0',
      organizationId: 2,
      organizationName: 'Tech Solutions',
      success: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const [stats] = useState<ActivityStats>({
    totalLogins: 1234,
    failedLogins: 45,
    activeUsers: 892,
    newSignups: 23,
    passwordResets: 12,
  });

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
  const [totalPages] = useState(5);

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
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
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
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              placeholder="From Date"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              placeholder="To Date"
            />
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
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

      {/* Activity Table */}
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <span>Multiple failed login attempts from IP 192.168.1.3</span>
              <Badge variant="destructive">3 attempts</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Unusual login time detected for user jane@example.com</span>
              <Badge variant="outline">Review</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>New device login for user john@example.com</span>
              <Badge variant="outline">Monitor</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}