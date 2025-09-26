'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Shield,
  Calendar,
  Edit,
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
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
  email: string | null;
  phone: string | null;
  address: string | null;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
};

type RecentActivity = {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
};

export default function OrganizationViewPage() {
  const params = useParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchOrganizationData(params.id as string);
    }
  }, [params.id]);

  const fetchOrganizationData = async (id: string) => {
    try {
      setLoading(true);

      // Fetch organization details
      const orgResponse = await fetch(`/api/system-admin/organizations/${id}`);
      if (!orgResponse.ok) {
        throw new Error('Failed to fetch organization');
      }
      const orgData = await orgResponse.json();
      setOrganization(orgData);

      // Fetch team members
      const membersResponse = await fetch(`/api/system-admin/organizations/${id}/members`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setTeamMembers(membersData);
      }

      // Fetch recent activity
      const activityResponse = await fetch(`/api/system-admin/organizations/${id}/activity`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, trialEndsAt: string | null) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      active: 'default',
      trial: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
    };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Error: {error || 'Organization not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/organizations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-1">
                Organization ID: {organization.id}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {getStatusBadge(organization.status, organization.trialEndsAt)}
            <Link href={`/admin/organizations/${organization.id}/edit`}>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-semibold">
                  {organization.userCount}
                  {organization.maxUsers && (
                    <span className="text-sm text-gray-500">/{organization.maxUsers}</span>
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assets</p>
                <p className="text-2xl font-semibold">{organization.assetCount}</p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Incidents</p>
                <p className="text-2xl font-semibold">{organization.incidentCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-xl font-semibold">{organization.planName || 'Free'}</p>
              </div>
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Complete information about this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Organization Name</p>
                      <p className="font-medium">{organization.name}</p>
                    </div>
                    {organization.industry && (
                      <div>
                        <p className="text-sm text-gray-600">Industry</p>
                        <p className="font-medium">{organization.industry}</p>
                      </div>
                    )}
                    {organization.size && (
                      <div>
                        <p className="text-sm text-gray-600">Company Size</p>
                        <p className="font-medium capitalize">{organization.size}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {organization.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {organization.email}
                        </p>
                      </div>
                    )}
                    {organization.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {organization.phone}
                        </p>
                      </div>
                    )}
                    {organization.website && (
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <p className="font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {organization.website}
                          </a>
                        </p>
                      </div>
                    )}
                    {organization.address && (
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{organization.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Subscription Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="font-medium">{organization.planName || 'Free Plan'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(organization.status, organization.trialEndsAt)}
                      </div>
                    </div>
                    {organization.trialEndsAt && (
                      <div>
                        <p className="text-sm text-gray-600">Trial Ends</p>
                        <p className="font-medium">{new Date(organization.trialEndsAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {organization.maxUsers && (
                      <div>
                        <p className="text-sm text-gray-600">User Limit</p>
                        <p className="font-medium">{organization.maxUsers} users</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">System Information</h3>
                  <div className="space-y-3">
                    {organization.customDomain && (
                      <div>
                        <p className="text-sm text-gray-600">Custom Domain</p>
                        <p className="font-medium">{organization.customDomain}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(organization.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Users belonging to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-gray-500">No team members found</p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{member.role}</Badge>
                        <span className="text-sm text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events for this organization</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}