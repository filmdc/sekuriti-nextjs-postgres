'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Plus,
  Search,
  Users,
  Shield,
  Calendar,
  Eye,
  Edit,
  AlertCircle,
  Package,
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
  updatedAt: string;
  trialEndsAt: string | null;
  industry: string | null;
  size: string | null;
  customDomain: string | null;
  website: string | null;
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.customDomain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, trialEndsAt: string | null) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      active: 'default',
      trial: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
    };

    // Check if trial is expiring soon
    if (status === 'trial' && trialEndsAt) {
      const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) {
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
          </Badge>
        );
      }
    }

    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPlanBadge = (planName: string | null) => {
    if (!planName) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          No Plan
        </span>
      );
    }

    const colors: { [key: string]: string } = {
      'Enterprise': 'bg-purple-100 text-purple-800',
      'Professional': 'bg-blue-100 text-blue-800',
      'Standard': 'bg-gray-100 text-gray-800',
      'Free': 'bg-green-100 text-green-800',
    };

    const colorClass = Object.keys(colors).find(key =>
      planName.toLowerCase().includes(key.toLowerCase())
    );

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[colorClass || 'Standard']}`}>
        {planName}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600 mt-2">
              Manage all organizations and their subscription plans
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/organizations/provisioning">
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Provisioning
              </Button>
            </Link>
            <Link href="/admin/organizations/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="lg:col-span-3 flex gap-4">
            <Card className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Organizations</span>
                <span className="text-xl font-semibold">{organizations.length}</span>
              </div>
            </Card>
            <Card className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-xl font-semibold text-green-600">
                  {organizations.filter(o => o.status === 'active').length}
                </span>
              </div>
            </Card>
            <Card className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trials</span>
                <span className="text-xl font-semibold text-blue-600">
                  {organizations.filter(o => o.status === 'trial').length}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">{org.name}</p>
                            {org.customDomain && (
                              <p className="text-sm text-gray-500">{org.customDomain}</p>
                            )}
                            {org.industry && (
                              <p className="text-xs text-gray-400 mt-1">{org.industry}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {getPlanBadge(org.planName)}
                        {org.maxUsers && (
                          <p className="text-sm text-gray-500 mt-1">
                            {org.userCount} / {org.maxUsers} users
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Users className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{org.userCount} users</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Shield className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{org.assetCount} assets</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p>{org.incidentCount} incidents</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          Created {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(org.status, org.trialEndsAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/organizations/${org.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/organizations/${org.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}