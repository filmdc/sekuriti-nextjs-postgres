'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Search,
  UserPlus,
  Shield,
  Building2,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  KeyRound,
  UserCheck,
  Users,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system-admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/system-admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await fetch(`/api/system-admin/users/${userId}/reset`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reset password');

      toast({
        title: 'Success',
        description: 'Password reset email sent',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAdmin = async (userId: number, isSystemAdmin: boolean) => {
    try {
      const response = await fetch(`/api/system-admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSystemAdmin: !isSystemAdmin }),
      });

      if (!response.ok) throw new Error('Failed to update admin status');

      toast({
        title: 'Success',
        description: `Admin status ${!isSystemAdmin ? 'granted' : 'revoked'} successfully`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organizations.some(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'owner' && user.organizations.some(org => org.role === 'owner')) ||
      (roleFilter === 'admin' && user.organizations.some(org => org.role === 'admin')) ||
      (roleFilter === 'member' && user.organizations.some(org => org.role === 'member'));

    const matchesAdmin =
      adminFilter === 'all' ||
      (adminFilter === 'system' && user.isSystemAdmin) ||
      (adminFilter === 'org' && user.isOrganizationAdmin) ||
      (adminFilter === 'none' && !user.isSystemAdmin && !user.isOrganizationAdmin);

    return matchesSearch && matchesRole && matchesAdmin;
  });

  const getUserStats = () => {
    const total = users.length;
    const systemAdmins = users.filter(u => u.isSystemAdmin).length;
    const orgAdmins = users.filter(u => u.isOrganizationAdmin).length;
    const verified = users.filter(u => u.hasLoggedIn).length;

    return { total, systemAdmins, orgAdmins, verified };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all platform users and their permissions</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/users/admins">
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                System Admins
              </Button>
            </Link>
            <Link href="/admin/users/activity">
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Activity Logs
              </Button>
            </Link>
            <Link href="/admin/users/new">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.systemAdmins}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Org Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.orgAdmins}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or organization..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Admin Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admin Types</SelectItem>
                <SelectItem value="system">System Admins</SelectItem>
                <SelectItem value="org">Org Admins</SelectItem>
                <SelectItem value="none">Regular Users</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Organizations</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      {!user.hasLoggedIn && (
                        <Badge variant="warning" size="sm">Never Logged In</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.organizations.length > 0 ? (
                      user.organizations.slice(0, 2).map((org) => (
                        <Badge key={org.id} variant="outline" size="sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {org.name}
                          {org.role === 'owner' && (
                            <span className="ml-1 text-xs">(Owner)</span>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No organizations</span>
                    )}
                    {user.organizations.length > 2 && (
                      <Badge variant="outline" size="sm">
                        +{user.organizations.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.isSystemAdmin && (
                      <Badge variant="critical" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        System Admin
                      </Badge>
                    )}
                    {user.isOrganizationAdmin && (
                      <Badge variant="warning" size="sm">
                        Org Admin
                      </Badge>
                    )}
                    {!user.isSystemAdmin && !user.isOrganizationAdmin && (
                      <Badge variant="outline" size="sm">Regular</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleAdmin(user.id, user.isSystemAdmin)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {user.isSystemAdmin ? 'Revoke' : 'Grant'} System Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete User
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all associated data and organization memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}