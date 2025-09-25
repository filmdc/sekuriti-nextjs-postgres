'use client';

import { useState } from 'react';
import { useAdminAPI, adminAPI } from '@/lib/hooks/use-admin-api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCard,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  ChevronRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BillingOverview {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  growthRate: number;
  mrr: number;
  revenueByPlan: { plan: string; type: string; revenue: number; count: number }[];
  revenueHistory: { month: string; revenue: number; subscriptions: number }[];
  subscriptionStatus: { status: string; count: number; color: string }[];
  recentTransactions: {
    id: string;
    organization: string;
    amount: number;
    status: string;
    date: string;
    plan: string;
  }[];
  billingEvents?: Record<string, number>;
  usage?: {
    apiCalls: number;
    activeTeams: number;
  };
}

export default function BillingPage() {
  // Fetch billing overview data from real billing tables
  const { data: overview, isLoading: loading, mutate: refreshBilling } = useAdminAPI<BillingOverview>(
    '/api/system-admin/billing'
  );

  const handleExportReports = async () => {
    try {
      await adminAPI('/api/system-admin/billing/export', {
        method: 'POST',
        successMessage: 'Reports exported successfully',
      });
    } catch (error) {
      console.error('Error exporting reports:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Overview</h1>
          <p className="text-gray-500 mt-1">
            Manage subscriptions, licenses, and revenue tracking
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/billing/licenses"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Licenses</span>
            </div>
          </Link>
          <Link
            href="/admin/billing/plans"
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Plans</span>
            </div>
          </Link>
          <Link
            href="/admin/billing/usage"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Usage Reports</span>
            </div>
          </Link>
          <Button
            onClick={() => refreshBilling()}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(overview?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +{overview?.growthRate || 0}% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.activeSubscriptions || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {overview?.subscriptionStatus?.find(s => s.status === 'Trialing')?.count || 0} trials in progress
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.churnRate || 0}%
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {overview?.subscriptionStatus?.find(s => s.status === 'Canceled')?.count || 0} cancellations
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600 rotate-180" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{overview?.growthRate || 0}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  MRR: {formatCurrency(overview?.mrr || 0)}/mo
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue and subscription growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={overview?.revenueHistory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef4444"
                  name="Revenue ($)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#3b82f6"
                  name="Subscriptions"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Current subscription distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overview?.subscriptionStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(overview?.subscriptionStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Revenue distribution across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overview?.revenueByPlan || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {(overview?.revenueByPlan || []).map((plan) => (
                <div key={plan.plan} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      plan.type === 'enterprise' ? 'bg-purple-500' :
                      plan.type === 'professional' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium">{plan.plan}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.count} subscriptions • {formatCurrency(plan.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest billing activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(overview?.recentTransactions || []).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(transaction.status)}
                    <div>
                      <p className="font-medium text-sm">{transaction.organization}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.id} • {transaction.plan}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/admin/billing/transactions"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              View all transactions
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common billing management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/billing/licenses"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Manage Licenses</p>
              <p className="text-xs text-gray-500 mt-1">Allocate and track licenses</p>
            </Link>
            <Link
              href="/admin/billing/plans"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Subscription Plans</p>
              <p className="text-xs text-gray-500 mt-1">Configure pricing tiers</p>
            </Link>
            <Link
              href="/admin/billing/usage"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Usage Reports</p>
              <p className="text-xs text-gray-500 mt-1">Monitor resource usage</p>
            </Link>
            <button
              onClick={handleExportReports}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="font-medium">Export Reports</p>
              <p className="text-xs text-gray-500 mt-1">Download billing data</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}