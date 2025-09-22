'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Users,
  Key,
  Calendar,
  Globe,
  Phone,
  MapPin,
  Package,
  Shield,
  AlertTriangle,
  Edit,
  Power,
  Trash2,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  HardDrive,
  Activity,
  Mail,
  User,
  Settings,
} from 'lucide-react';

interface Organization {
  id: number;
  name: string;
  status: string;
  licenseType: string;
  licenseCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  trialEndsAt?: string;
  industry?: string;
  size?: string;
  customDomain?: string;
  website?: string;
  address?: string;
  phone?: string;
  allowedEmailDomains?: string;
  features?: string;
  metadata?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planName?: string;
  subscriptionStatus?: string;
  userCount: number;
  incidentCount: number;
  assetCount: number;
}

interface OrganizationLimits {
  maxUsers: number;
  currentUsers: number;
  maxStorageMb: number;
  currentStorageMb: number;
  maxIncidents: number;
  maxAssets: number;
  maxRunbooks: number;
  maxTemplates: number;
  customDomainsAllowed: boolean;
  whitelabelingAllowed: boolean;
  ssoAllowed: boolean;
  apiAccessAllowed: boolean;
}

interface RecentUser {
  id: number;
  name?: string;
  email: string;
  role: string;
  joinedAt: string;
  lastLoginAt?: string;
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [limits, setLimits] = useState<OrganizationLimits | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'activate' | 'delete' | null;
  }>({ open: false, type: null });

  useEffect(() => {
    fetchOrganizationDetails();
  }, [params.id]);

  const fetchOrganizationDetails = async () => {
    try {
      const response = await fetch(`/api/system-admin/organizations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
        setLimits(data.limits);
        setRecentUsers(data.recentUsers || []);
      } else {
        throw new Error('Failed to fetch organization details');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/system-admin/organizations/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Organization status changed to ${newStatus}`,
        });
        fetchOrganizationDetails();
        setActionDialog({ open: false, type: null });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/system-admin/organizations/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Organization deleted successfully',
        });
        router.push('/system-admin/organizations');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete organization');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Organization not found</h2>
        <Link href="/system-admin/organizations">
          <Button className="mt-4">Back to Organizations</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      trial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: AlertTriangle },
    };

    const variant = variants[status] || variants.expired;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const features = organization.features ? JSON.parse(organization.features) : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/system-admin/organizations">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(organization.status)}
              <Badge variant="outline">{organization.licenseType}</Badge>
              <Badge variant="secondary">{organization.size || 'Unknown Size'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/system-admin/organizations/${params.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {organization.status === 'active' ? (
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: true, type: 'suspend' })}
            >
              <Power className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: true, type: 'activate' })}
            >
              <Power className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setActionDialog({ open: true, type: 'delete' })}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{organization.userCount}</p>
                <p className="text-xs text-muted-foreground">
                  of {organization.licenseCount} licenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{organization.incidentCount}</p>
                <p className="text-xs text-muted-foreground">Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{organization.assetCount}</p>
                <p className="text-xs text-muted-foreground">Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {limits ? `${limits.currentStorageMb}MB` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {limits ? `${limits.maxStorageMb}MB` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="users">Users ({recentUsers.length})</TabsTrigger>
          <TabsTrigger value="limits">Limits & Features</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic details about the organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="text-base">{organization.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    {organization.website ? (
                      <a href={organization.website} target="_blank" rel="noopener noreferrer"
                         className="text-base text-blue-600 hover:underline flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {organization.website}
                      </a>
                    ) : (
                      <p className="text-base text-muted-foreground">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Custom Domain</p>
                    <p className="text-base">{organization.customDomain || 'Not configured'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-base">
                      {new Date(organization.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    {organization.phone ? (
                      <p className="text-base flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {organization.phone}
                      </p>
                    ) : (
                      <p className="text-base text-muted-foreground">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    {organization.address ? (
                      <p className="text-base flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {organization.address}
                      </p>
                    ) : (
                      <p className="text-base text-muted-foreground">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expires At</p>
                    <p className="text-base">
                      {organization.expiresAt
                        ? new Date(organization.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-base">
                      {new Date(organization.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organization Users</CardTitle>
                <CardDescription>Recent users in this organization</CardDescription>
              </div>
              <Link href={`/system-admin/organizations/${params.id}/users`}>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Manage All Users
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name || 'Unnamed User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {recentUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found in this organization
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Resource Limits & Features</CardTitle>
              <CardDescription>Organization quotas and enabled features</CardDescription>
            </CardHeader>
            <CardContent>
              {limits ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Resource Limits</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Users</span>
                          <span className="text-sm font-medium">
                            {limits.currentUsers} / {limits.maxUsers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Storage</span>
                          <span className="text-sm font-medium">
                            {limits.currentStorageMb}MB / {limits.maxStorageMb}MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Max Incidents</span>
                          <span className="text-sm font-medium">{limits.maxIncidents || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Max Assets</span>
                          <span className="text-sm font-medium">{limits.maxAssets || 'Unlimited'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Max Runbooks</span>
                          <span className="text-sm font-medium">{limits.maxRunbooks || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Max Templates</span>
                          <span className="text-sm font-medium">{limits.maxTemplates || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">API Rate Limit</span>
                          <span className="text-sm font-medium">1000/hour</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Features</h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">Custom Domains</span>
                        {limits.customDomainsAllowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">White-labeling</span>
                        {limits.whitelabelingAllowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">Single Sign-On</span>
                        {limits.ssoAllowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm">API Access</span>
                        {limits.apiAccessAllowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No limits configured for this organization
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                    <p className="text-base">{organization.planName || organization.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscription Status</p>
                    <p className="text-base">{organization.subscriptionStatus || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stripe Customer ID</p>
                    <p className="text-base font-mono text-xs">
                      {organization.stripeCustomerId || 'Not connected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stripe Subscription ID</p>
                    <p className="text-base font-mono text-xs">
                      {organization.stripeSubscriptionId || 'Not connected'}
                    </p>
                  </div>
                </div>
                {organization.trialEndsAt && (
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm">
                        Trial ends on {new Date(organization.trialEndsAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open, type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'delete' && 'Delete Organization'}
              {actionDialog.type === 'suspend' && 'Suspend Organization'}
              {actionDialog.type === 'activate' && 'Activate Organization'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'delete' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500 inline mr-2" />
                  This will permanently delete "{organization.name}" and all associated data.
                  This action cannot be undone.
                </>
              )}
              {actionDialog.type === 'suspend' && (
                <>
                  Are you sure you want to suspend "{organization.name}"?
                  Users will lose access to the platform.
                </>
              )}
              {actionDialog.type === 'activate' && (
                <>
                  Are you sure you want to activate "{organization.name}"?
                  Users will regain access to the platform.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionDialog.type === 'delete') {
                  handleDelete();
                } else if (actionDialog.type === 'suspend') {
                  handleStatusChange('suspended');
                } else if (actionDialog.type === 'activate') {
                  handleStatusChange('active');
                }
              }}
              className={actionDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionDialog.type === 'delete' && 'Delete Organization'}
              {actionDialog.type === 'suspend' && 'Suspend Organization'}
              {actionDialog.type === 'activate' && 'Activate Organization'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}