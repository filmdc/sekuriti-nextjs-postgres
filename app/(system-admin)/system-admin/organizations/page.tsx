'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2,
  MoreVertical,
  Search,
  Plus,
  Users,
  Key,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Power,
  Trash2,
  Download,
  Upload,
  Filter,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Organization {
  id: number;
  name: string;
  status: string;
  licenseType: string;
  licenseCount: number;
  usedLicenses: number;
  createdAt: string;
  expiresAt?: string;
  industry?: string;
  size?: string;
  customDomain?: string;
  userCount: number;
  incidentCount: number;
  assetCount: number;
}

export default function OrganizationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'delete' | 'activate' | null;
  }>({ open: false, type: null });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/system-admin/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        throw new Error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'suspend' | 'delete' | 'activate') => {
    if (!selectedOrg) return;

    try {
      const endpoint = action === 'delete'
        ? `/api/system-admin/organizations/${selectedOrg.id}`
        : `/api/system-admin/organizations/${selectedOrg.id}/status`;

      const response = await fetch(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ status: action === 'activate' ? 'active' : 'suspended' }) : undefined,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Organization ${action}d successfully`,
        });
        setActionDialog({ open: false, type: null });
        fetchOrganizations();
      } else {
        throw new Error(`Failed to ${action} organization`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} organization`,
        variant: 'destructive',
      });
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.customDomain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    const matchesLicense = licenseFilter === 'all' || org.licenseType === licenseFilter;
    return matchesSearch && matchesStatus && matchesLicense;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
      trial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: AlertCircle },
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

  const getLicenseBadge = (type: string) => {
    const colors: Record<string, string> = {
      standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      professional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      enterprise: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    };

    return (
      <Badge className={colors[type] || colors.standard}>
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Manage all organizations on the platform
          </p>
        </div>
        <Link href="/system-admin/organizations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{organizations.length}</p>
                <p className="text-xs text-muted-foreground">Total Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organizations.filter(o => o.status === 'active').length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organizations.filter(o => o.status === 'trial').length}
                </p>
                <p className="text-xs text-muted-foreground">Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {organizations.reduce((sum, org) => sum + org.userCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={licenseFilter} onValueChange={setLicenseFilter}>
              <SelectTrigger className="w-[180px]">
                <Key className="h-4 w-4 mr-2" />
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Licenses</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{org.name}</p>
                      {org.customDomain && (
                        <p className="text-xs text-muted-foreground">{org.customDomain}</p>
                      )}
                      {org.industry && (
                        <p className="text-xs text-muted-foreground">
                          {org.industry} • {org.size}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getLicenseBadge(org.licenseType)}
                      <p className="text-xs text-muted-foreground">
                        {org.usedLicenses}/{org.licenseCount} licenses
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{org.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <p>{org.incidentCount} incidents</p>
                      <p>{org.assetCount} assets</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(org.createdAt).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    {org.expiresAt ? (
                      <p className="text-sm">{new Date(org.expiresAt).toLocaleDateString()}</p>
                    ) : (
                      <span className="text-xs text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/system-admin/organizations/${org.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/system-admin/organizations/${org.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/system-admin/organizations/${org.id}/users`)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Impersonate Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {org.status === 'active' ? (
                          <DropdownMenuItem
                            className="text-yellow-600"
                            onClick={() => {
                              setSelectedOrg(org);
                              setActionDialog({ open: true, type: 'suspend' });
                            }}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Suspend Organization
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => {
                              setSelectedOrg(org);
                              setActionDialog({ open: true, type: 'activate' });
                            }}
                          >
                            <Power className="h-4 w-4 mr-2" />
                            Activate Organization
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedOrg(org);
                            setActionDialog({ open: true, type: 'delete' });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Organization
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, type: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'delete' && 'Delete Organization'}
              {actionDialog.type === 'suspend' && 'Suspend Organization'}
              {actionDialog.type === 'activate' && 'Activate Organization'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'delete' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500 inline mr-2" />
                  This will permanently delete the organization "{selectedOrg?.name}" and all associated data.
                  This action cannot be undone.
                </>
              )}
              {actionDialog.type === 'suspend' && (
                <>
                  Are you sure you want to suspend "{selectedOrg?.name}"?
                  Users will lose access to the platform.
                </>
              )}
              {actionDialog.type === 'activate' && (
                <>
                  Are you sure you want to activate "{selectedOrg?.name}"?
                  Users will regain access to the platform.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'delete' ? 'destructive' : 'default'}
              onClick={() => actionDialog.type && handleAction(actionDialog.type)}
            >
              {actionDialog.type === 'delete' && 'Delete Organization'}
              {actionDialog.type === 'suspend' && 'Suspend Organization'}
              {actionDialog.type === 'activate' && 'Activate Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}