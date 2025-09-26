'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Package,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Server,
  Activity,
  AlertTriangle,
  BarChart3,
  Zap,
  RefreshCw,
} from 'lucide-react';

type Organization = {
  id: number;
  name: string;
  status: string;
  planName: string | null;
  maxUsers: number | null;
  userCount: number;
  incidentCount: number;
  assetCount: number;
  createdAt: string;
  trialEndsAt: string | null;
};

type ProvisioningStatus = {
  organizationId: number;
  organizationName: string;
  status: 'pending' | 'active' | 'suspended' | 'expired';
  setupProgress: number;
  steps: {
    name: string;
    completed: boolean;
    timestamp?: string;
  }[];
};

export default function ProvisioningPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system-admin/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate provisioning statistics
  const stats = {
    total: organizations.length,
    active: organizations.filter(o => o.status === 'active').length,
    trial: organizations.filter(o => o.status === 'trial').length,
    suspended: organizations.filter(o => o.status === 'suspended').length,
    totalUsers: organizations.reduce((acc, org) => acc + (org.maxUsers || 0), 0),
    activeUsers: organizations.reduce((acc, org) => acc + org.userCount, 0),
    averageUtilization: organizations.length > 0
      ? Math.round((organizations.reduce((acc, org) => {
          if (org.maxUsers && org.maxUsers > 0) {
            return acc + (org.userCount / org.maxUsers * 100);
          }
          return acc;
        }, 0) / organizations.filter(o => o.maxUsers && o.maxUsers > 0).length))
      : 0,
  };

  // Mock provisioning queue data
  const provisioningQueue: ProvisioningStatus[] = [
    {
      organizationId: 1,
      organizationName: 'New Corp Inc.',
      status: 'pending',
      setupProgress: 60,
      steps: [
        { name: 'Create organization', completed: true, timestamp: '2024-01-15T10:00:00Z' },
        { name: 'Setup database', completed: true, timestamp: '2024-01-15T10:01:00Z' },
        { name: 'Configure permissions', completed: true, timestamp: '2024-01-15T10:02:00Z' },
        { name: 'Initialize templates', completed: false },
        { name: 'Send welcome email', completed: false },
      ],
    },
    {
      organizationId: 2,
      organizationName: 'Tech Solutions Ltd.',
      status: 'pending',
      setupProgress: 20,
      steps: [
        { name: 'Create organization', completed: true, timestamp: '2024-01-15T11:00:00Z' },
        { name: 'Setup database', completed: false },
        { name: 'Configure permissions', completed: false },
        { name: 'Initialize templates', completed: false },
        { name: 'Send welcome email', completed: false },
      ],
    },
  ];

  const trialsExpiringSoon = organizations.filter((org) => {
    if (org.status !== 'trial' || !org.trialEndsAt) return false;
    const daysLeft = Math.ceil((new Date(org.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  });

  const overUserLimit = organizations.filter(org => org.maxUsers && org.userCount > org.maxUsers);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/organizations">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provisioning Management</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage organization provisioning and resource allocation
            </p>
          </div>
          <Button onClick={fetchOrganizations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">User Utilization</p>
              <p className="text-2xl font-bold mt-1">{stats.averageUtilization}%</p>
              <Progress value={stats.averageUtilization} className="mt-2" />
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold mt-1">
                {stats.activeUsers} / {stats.totalUsers}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Trials</p>
              <p className="text-2xl font-bold mt-1">{stats.trial}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {(trialsExpiringSoon.length > 0 || overUserLimit.length > 0 || provisioningQueue.length > 0) && (
        <div className="mb-8 space-y-4">
          {provisioningQueue.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 mr-3" />
                <div className="flex-1">
                  <p className="text-blue-800 font-medium">
                    {provisioningQueue.length} organizations in provisioning queue
                  </p>
                </div>
                <Button size="sm" variant="outline">View Queue</Button>
              </div>
            </div>
          )}

          {trialsExpiringSoon.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">
                    {trialsExpiringSoon.length} trials expiring within 7 days
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Consider reaching out to convert them to paid plans
                  </p>
                </div>
              </div>
            </div>
          )}

          {overUserLimit.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">
                    {overUserLimit.length} organizations exceeding user limits
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queue">Provisioning Queue</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Plan Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Enterprise</span>
                    <span className="text-sm font-medium">
                      {organizations.filter(o => o.planName?.toLowerCase().includes('enterprise')).length} orgs
                    </span>
                  </div>
                  <Progress
                    value={(organizations.filter(o => o.planName?.toLowerCase().includes('enterprise')).length / stats.total) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Professional</span>
                    <span className="text-sm font-medium">
                      {organizations.filter(o => o.planName?.toLowerCase().includes('professional')).length} orgs
                    </span>
                  </div>
                  <Progress
                    value={(organizations.filter(o => o.planName?.toLowerCase().includes('professional')).length / stats.total) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Standard</span>
                    <span className="text-sm font-medium">
                      {organizations.filter(o => o.planName?.toLowerCase().includes('standard') || !o.planName).length} orgs
                    </span>
                  </div>
                  <Progress
                    value={(organizations.filter(o => o.planName?.toLowerCase().includes('standard') || !o.planName).length / stats.total) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div className="flex items-center">
                    <Server className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">API Server</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="text-sm">Queue Workers</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-600 text-white">2 Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Provisioning Queue</h3>
            <div className="space-y-4">
              {provisioningQueue.map((item) => (
                <div key={item.organizationId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{item.organizationName}</p>
                      <p className="text-sm text-gray-500">ID: {item.organizationId}</p>
                    </div>
                    <Badge variant={item.status === 'pending' ? 'secondary' : 'default'}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Setup Progress</span>
                      <span>{item.setupProgress}%</span>
                    </div>
                    <Progress value={item.setupProgress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {item.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className={step.completed ? 'text-gray-700' : 'text-gray-500'}>
                          {step.name}
                        </span>
                        {step.timestamp && (
                          <span className="ml-auto text-xs text-gray-400">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">Retry</Button>
                    <Button size="sm" variant="outline">View Logs</Button>
                  </div>
                </div>
              ))}

              {provisioningQueue.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No organizations in provisioning queue
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Usage by Organization</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Users
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assets
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Incidents
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Storage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {organizations.slice(0, 5).map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{org.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm">{org.userCount}/{org.maxUsers || '∞'}</span>
                          {org.maxUsers && org.userCount > org.maxUsers && (
                            <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{org.assetCount}</td>
                      <td className="px-4 py-3 text-sm">{org.incidentCount}</td>
                      <td className="px-4 py-3 text-sm">{Math.round(Math.random() * 500)}MB</td>
                      <td className="px-4 py-3">
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Automation Rules</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Trial Expiry Notifications</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Automatically send email notifications 7, 3, and 1 day before trial expires
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Configure</Button>
                  <Button size="sm" variant="outline">View Logs</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">User Limit Warnings</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Alert organizations when they reach 80% of their user limit
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Configure</Button>
                  <Button size="sm" variant="outline">View Logs</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Automatic Suspension</h4>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Suspend organizations 30 days after payment failure
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Enable</Button>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}