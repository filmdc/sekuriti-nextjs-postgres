'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { format, formatRelative, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  FileText,
  ChevronLeft,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Download,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Settings,
  Key,
  FileEdit,
  Trash2,
  Mail,
  RefreshCw
} from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  userId: number;
  userName: string;
  userEmail: string;
  timestamp: string;
  ipAddress: string;
  details?: any;
  category: string;
  severity: 'info' | 'warning' | 'critical';
}

const actionIcons: Record<string, any> = {
  SIGN_IN: LogIn,
  SIGN_OUT: LogOut,
  SIGN_UP: UserPlus,
  UPDATE_PASSWORD: Key,
  DELETE_ACCOUNT: UserMinus,
  UPDATE_ACCOUNT: Settings,
  CREATE_TEAM: Shield,
  REMOVE_TEAM_MEMBER: UserMinus,
  INVITE_TEAM_MEMBER: Mail,
  ACCEPT_INVITATION: CheckCircle,
  CREATE_INCIDENT: AlertTriangle,
  UPDATE_INCIDENT: FileEdit,
  CLOSE_INCIDENT: CheckCircle,
  CREATE_ASSET: FileEdit,
  UPDATE_ASSET: FileEdit,
  DELETE_ASSET: Trash2,
  CREATE_RUNBOOK: FileText,
  UPDATE_RUNBOOK: FileEdit,
  START_EXERCISE: Activity,
  COMPLETE_EXERCISE: CheckCircle,
  UPLOAD_EVIDENCE: FileText
};

const actionCategories = {
  SIGN_IN: 'Authentication',
  SIGN_OUT: 'Authentication',
  SIGN_UP: 'Authentication',
  UPDATE_PASSWORD: 'Security',
  DELETE_ACCOUNT: 'Account',
  UPDATE_ACCOUNT: 'Account',
  CREATE_TEAM: 'Organization',
  REMOVE_TEAM_MEMBER: 'Team',
  INVITE_TEAM_MEMBER: 'Team',
  ACCEPT_INVITATION: 'Team',
  CREATE_INCIDENT: 'Incident',
  UPDATE_INCIDENT: 'Incident',
  CLOSE_INCIDENT: 'Incident',
  CREATE_ASSET: 'Asset',
  UPDATE_ASSET: 'Asset',
  DELETE_ASSET: 'Asset',
  CREATE_RUNBOOK: 'Runbook',
  UPDATE_RUNBOOK: 'Runbook',
  START_EXERCISE: 'Exercise',
  COMPLETE_EXERCISE: 'Exercise',
  UPLOAD_EVIDENCE: 'Evidence'
};

const actionSeverity = {
  SIGN_IN: 'info',
  SIGN_OUT: 'info',
  SIGN_UP: 'info',
  UPDATE_PASSWORD: 'warning',
  DELETE_ACCOUNT: 'critical',
  UPDATE_ACCOUNT: 'info',
  CREATE_TEAM: 'info',
  REMOVE_TEAM_MEMBER: 'warning',
  INVITE_TEAM_MEMBER: 'info',
  ACCEPT_INVITATION: 'info',
  CREATE_INCIDENT: 'warning',
  UPDATE_INCIDENT: 'info',
  CLOSE_INCIDENT: 'info',
  CREATE_ASSET: 'info',
  UPDATE_ASSET: 'info',
  DELETE_ASSET: 'warning',
  CREATE_RUNBOOK: 'info',
  UPDATE_RUNBOOK: 'info',
  START_EXERCISE: 'info',
  COMPLETE_EXERCISE: 'info',
  UPLOAD_EVIDENCE: 'info'
};

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, selectedCategory, selectedSeverity, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        category: selectedCategory,
        severity: selectedSeverity,
        ...(dateRange.from && { from: dateRange.from.toISOString() }),
        ...(dateRange.to && { to: dateRange.to.toISOString() })
      });

      const response = await fetch(`/api/organization/audit?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs.map((log: any) => ({
          ...log,
          category: actionCategories[log.action as keyof typeof actionCategories] || 'Other',
          severity: actionSeverity[log.action as keyof typeof actionSeverity] || 'info'
        })));
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        severity: selectedSeverity,
        ...(dateRange.from && { from: dateRange.from.toISOString() }),
        ...(dateRange.to && { to: dateRange.to.toISOString() }),
        format: 'csv'
      });

      const response = await fetch(`/api/organization/audit/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Audit logs exported successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export audit logs',
        variant: 'destructive'
      });
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ipAddress?.includes(searchTerm);
    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || Activity;
    return Icon;
  };

  const getActionLabel = (action: string) => {
    return action.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Authentication': 'bg-blue-100 text-blue-800',
      'Security': 'bg-red-100 text-red-800',
      'Account': 'bg-green-100 text-green-800',
      'Organization': 'bg-purple-100 text-purple-800',
      'Team': 'bg-indigo-100 text-indigo-800',
      'Incident': 'bg-orange-100 text-orange-800',
      'Asset': 'bg-teal-100 text-teal-800',
      'Runbook': 'bg-cyan-100 text-cyan-800',
      'Exercise': 'bg-pink-100 text-pink-800',
      'Evidence': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="outline" className={colors[category] || ''}>
        {category}
      </Badge>
    );
  };

  const categories = Array.from(new Set(Object.values(actionCategories)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">
              Track all activities and changes in your organization
            </p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logs.map(l => l.userId)).size}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.severity === 'warning').length}
                </p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.severity === 'critical').length}
                </p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by user, action, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No audit logs found for the selected filters
              </p>
            ) : (
              filteredLogs.map((log) => {
                const Icon = getActionIcon(log.action);
                return (
                  <div key={log.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                    <div className="p-2 rounded-full bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getActionLabel(log.action)}</p>
                        {getCategoryBadge(log.category)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userName || log.userEmail}
                        </span>
                        <span>{formatRelative(new Date(log.timestamp), new Date())}</span>
                        {log.ipAddress && (
                          <span className="font-mono text-xs">{log.ipAddress}</span>
                        )}
                      </div>
                      {log.details && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}