'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  FileText,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Mock data - in production, fetch from database with pagination
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-12-20 14:32:15',
      user: 'admin@sekuriti.io',
      action: 'UPDATE_SYSTEM_SETTINGS',
      resource: 'System Settings',
      details: 'Changed session timeout from 30 to 60 minutes',
      ip: '192.168.1.100',
      severity: 'info',
      status: 'success',
    },
    {
      id: 2,
      timestamp: '2024-12-20 14:15:43',
      user: 'john.doe@example.com',
      action: 'CREATE_INCIDENT',
      resource: 'Incident #INC-2024-089',
      details: 'Created new security incident: Suspicious login attempts',
      ip: '10.0.0.45',
      severity: 'warning',
      status: 'success',
    },
    {
      id: 3,
      timestamp: '2024-12-20 13:58:21',
      user: 'system',
      action: 'FAILED_LOGIN',
      resource: 'Authentication',
      details: 'Multiple failed login attempts from IP 45.142.120.34',
      ip: '45.142.120.34',
      severity: 'error',
      status: 'failed',
    },
    {
      id: 4,
      timestamp: '2024-12-20 13:42:10',
      user: 'sarah.jones@example.com',
      action: 'UPDATE_USER',
      resource: 'User Profile',
      details: 'Updated user role from member to admin',
      ip: '192.168.1.85',
      severity: 'info',
      status: 'success',
    },
    {
      id: 5,
      timestamp: '2024-12-20 12:30:00',
      user: 'system',
      action: 'BACKUP_DATABASE',
      resource: 'Database',
      details: 'Automated daily backup completed successfully',
      ip: 'localhost',
      severity: 'info',
      status: 'success',
    },
    {
      id: 6,
      timestamp: '2024-12-20 11:15:22',
      user: 'mike.wilson@example.com',
      action: 'DELETE_ASSET',
      resource: 'Asset Management',
      details: 'Deleted asset: Legacy Server #SRV-001',
      ip: '10.0.0.78',
      severity: 'warning',
      status: 'success',
    },
    {
      id: 7,
      timestamp: '2024-12-20 10:45:18',
      user: 'admin@sekuriti.io',
      action: 'RESET_PASSWORD',
      resource: 'User Management',
      details: 'Password reset for user test@example.com',
      ip: '192.168.1.100',
      severity: 'warning',
      status: 'success',
    },
    {
      id: 8,
      timestamp: '2024-12-20 09:30:45',
      user: 'alice.brown@example.com',
      action: 'CREATE_RUNBOOK',
      resource: 'Runbook Management',
      details: 'Created new runbook: Ransomware Response Procedure',
      ip: '10.0.0.92',
      severity: 'info',
      status: 'success',
    },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'info':
        return <Badge>Info</Badge>;
      default:
        return <Badge variant="outline">Debug</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? (
      <Badge className="bg-green-100 text-green-800">Success</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            </div>
            <p className="text-gray-600">
              Track and review all system activities and changes
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events (24h)</p>
              <p className="text-2xl font-bold mt-1">1,234</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Actions</p>
              <p className="text-2xl font-bold mt-1">23</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Security Events</p>
              <p className="text-2xl font-bold mt-1">45</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold mt-1">89</p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs by user, action, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="incident">Incident</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{log.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {log.action}
                  </code>
                </TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-gray-600 truncate">{log.details}</p>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{log.ip}</span>
                </TableCell>
                <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                <TableCell>{getStatusBadge(log.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1-8 of 1,234 entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Security Events */}
      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Recent Security Events
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded">
            <div className="flex items-center gap-3">
              {getSeverityIcon('error')}
              <div>
                <p className="font-medium text-sm">Multiple failed login attempts</p>
                <p className="text-sm text-gray-600">IP: 45.142.120.34 attempted 5 failed logins</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">10 minutes ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <div className="flex items-center gap-3">
              {getSeverityIcon('warning')}
              <div>
                <p className="font-medium text-sm">Privilege escalation</p>
                <p className="text-sm text-gray-600">User role changed from member to admin</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
            <div className="flex items-center gap-3">
              {getSeverityIcon('warning')}
              <div>
                <p className="font-medium text-sm">Sensitive data accessed</p>
                <p className="text-sm text-gray-600">API keys viewed by user john.doe@example.com</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">5 hours ago</p>
          </div>
        </div>
      </Card>
    </div>
  );
}