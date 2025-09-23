'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Shield,
  ShieldOff,
  UserPlus,
  Search,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Key,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface SystemAdmin {
  id: number;
  name: string;
  email: string;
  isSystemAdmin: boolean;
  isOrganizationAdmin: boolean;
  hasLoggedIn: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  organizations: {
    id: number;
    name: string;
    role: string;
  }[];
}

export default function SystemAdminsPage() {
  const [admins, setAdmins] = useState<SystemAdmin[]>([]);
  const [allUsers, setAllUsers] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [revokeUserId, setRevokeUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system-admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();

      const systemAdmins = data.users.filter((u: SystemAdmin) => u.isSystemAdmin);
      const regularUsers = data.users.filter((u: SystemAdmin) => !u.isSystemAdmin);

      setAdmins(systemAdmins);
      setAllUsers(regularUsers);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system administrators',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/system-admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSystemAdmin: true }),
      });

      if (!response.ok) throw new Error('Failed to grant admin access');

      toast({
        title: 'Success',
        description: 'System admin privileges granted successfully',
      });

      setAddDialogOpen(false);
      setSelectedUserId(null);
      setUserSearchQuery('');
      fetchAdmins();
    } catch (error) {
      console.error('Error granting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant system admin privileges',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/system-admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSystemAdmin: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke admin access');
      }

      toast({
        title: 'Success',
        description: 'System admin privileges revoked successfully',
      });

      setRevokeUserId(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error revoking admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke system admin privileges',
        variant: 'destructive',
      });
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const getTimeSinceLogin = (date: string | null) => {
    if (!date) return 'Never logged in';
    const now = new Date();
    const lastLogin = new Date(date);
    const diff = now.getTime() - lastLogin.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 30) return `${Math.floor(days / 30)} months ago`;
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    return 'Recently';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading administrators...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">System Administrators</h1>
            </div>
            <p className="text-gray-600 ml-11">
              Manage users with full system access and administrative privileges
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add System Admin
          </Button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Critical Access Level</h3>
              <p className="text-sm text-amber-700 mt-1">
                System administrators have full access to all organizations, user data, and system settings.
                Grant these privileges carefully and regularly audit access.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active (24h)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => {
                    if (!a.lastLoginAt) return false;
                    const lastLogin = new Date(a.lastLoginAt);
                    const now = new Date();
                    const diff = now.getTime() - lastLogin.getTime();
                    return diff < 24 * 60 * 60 * 1000;
                  }).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {admins.filter(a => a.hasLoggedIn).length} / {admins.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search administrators..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Administrator</TableHead>
              <TableHead>Organizations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Access Granted</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {admin.organizations.length > 0 ? (
                      admin.organizations.slice(0, 2).map((org) => (
                        <Badge key={org.id} variant="outline" size="sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {org.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">System access only</span>
                    )}
                    {admin.organizations.length > 2 && (
                      <Badge variant="outline" size="sm">
                        +{admin.organizations.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {admin.hasLoggedIn ? (
                      <Badge variant="success" size="sm">
                        <Mail className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{formatDate(admin.createdAt)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{getTimeSinceLogin(admin.lastLoginAt)}</p>
                    {admin.lastLoginAt && (
                      <p className="text-gray-500">
                        {new Date(admin.lastLoginAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeUserId(admin.id)}
                    disabled={admins.length === 1}
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Revoke Access
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grant System Administrator Access</DialogTitle>
            <DialogDescription>
              Select a user to grant full system administrator privileges.
              This action will give them complete access to all system functions.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>

            <div className="border rounded-lg max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organizations</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.slice(0, 10).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.organizations.length > 0
                            ? `${user.organizations.length} organization(s)`
                            : 'No organizations'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isOrganizationAdmin ? (
                          <Badge variant="outline" size="sm">Org Admin</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Regular User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedUserId(user.id)}
                          variant={selectedUserId === user.id ? 'default' : 'outline'}
                        >
                          {selectedUserId === user.id ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setSelectedUserId(null);
                setUserSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedUserId && handleGrantAdmin(selectedUserId)}
              disabled={!selectedUserId}
            >
              <Shield className="h-4 w-4 mr-2" />
              Grant Admin Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Admin Confirmation */}
      <AlertDialog open={!!revokeUserId} onOpenChange={() => setRevokeUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Revoke System Administrator Access
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all system administrator privileges from this user.
              They will no longer have access to the system administration portal.
              {admins.length === 1 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This is the last system administrator. You cannot remove them.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeUserId && handleRevokeAdmin(revokeUserId)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}