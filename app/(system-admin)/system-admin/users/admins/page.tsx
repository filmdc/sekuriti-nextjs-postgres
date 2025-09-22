'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from '@/components/ui/use-toast';
import {
  Shield,
  UserPlus,
  UserX,
  Calendar,
  Mail,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface SystemAdmin {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export default function SystemAdminsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<SystemAdmin[]>([]);

  // Add admin dialog
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  // Remove admin dialog
  const [removeAdminOpen, setRemoveAdminOpen] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<SystemAdmin | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/system-admin/users');
      if (response.ok) {
        const data = await response.json();
        const systemAdmins = data.users.filter((u: any) => u.isSystemAdmin);
        setAdmins(systemAdmins);
      } else {
        throw new Error('Failed to fetch system admins');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email to search',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/system-admin/users');
      if (response.ok) {
        const data = await response.json();
        const results = data.users.filter(
          (u: any) => u.email.toLowerCase().includes(searchEmail.toLowerCase()) && !u.isSystemAdmin
        );
        setSearchResults(results);

        if (results.length === 0) {
          toast({
            title: 'No Results',
            description: 'No users found matching that email',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user to grant admin privileges',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(`/api/system-admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSystemAdmin: true,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'System admin privileges granted',
        });
        setAddAdminOpen(false);
        setSearchEmail('');
        setSearchResults([]);
        setSelectedUserId(null);
        fetchAdmins();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grant admin privileges');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    // Check if this is the last admin
    if (admins.length <= 1) {
      toast({
        title: 'Error',
        description: 'Cannot remove the last system administrator',
        variant: 'destructive',
      });
      return;
    }

    setRemoving(true);

    try {
      const response = await fetch(`/api/system-admin/users/${adminToRemove.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSystemAdmin: false,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'System admin privileges revoked',
        });
        setRemoveAdminOpen(false);
        setAdminToRemove(null);
        fetchAdmins();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke admin privileges');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Administrators</h2>
          <p className="text-muted-foreground">
            Manage platform-wide administrator access
          </p>
        </div>
        <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Administrator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Grant System Administrator Privileges</DialogTitle>
              <DialogDescription>
                Search for a user to grant system administrator privileges
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted transition-colors ${
                        selectedUserId === user.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name || 'No Name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.organizations.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Member of: {user.organizations.map((o: any) => o.name).join(', ')}
                            </p>
                          )}
                        </div>
                        {selectedUserId === user.id && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchEmail && !searching && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Try searching with a different email.
                </div>
              )}

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20 p-4">
                <div className="flex">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Important Security Notice</p>
                    <p>
                      System administrators have full access to all organizations, users, and settings.
                      Only grant this privilege to trusted platform administrators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddAdminOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAdmin} disabled={adding || !selectedUserId}>
                {adding ? 'Granting...' : 'Grant Admin Privileges'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Card */}
      {admins.length === 1 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Single Administrator Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              There is currently only one system administrator. Consider adding additional administrators
              to prevent lockout scenarios and ensure business continuity.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Administrators ({admins.length})</CardTitle>
          <CardDescription>
            Users with full platform access and control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.name || 'No Name'}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600">
                        <Shield className="h-3 w-3 mr-1" />
                        System Admin
                      </Badge>
                      {admin.emailVerified ? (
                        <Badge variant="outline" className="text-green-600">
                          <Mail className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.lastLoginAt ? (
                      <div className="text-sm">
                        {new Date(admin.lastLoginAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAdminToRemove(admin);
                        setRemoveAdminOpen(true);
                      }}
                      disabled={admins.length <= 1}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
          <CardDescription>
            Recommendations for managing system administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Maintain Multiple Administrators</p>
                <p className="text-sm text-muted-foreground">
                  Always have at least 2-3 system administrators to prevent lockout scenarios
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Regular Access Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Periodically review and audit system administrator access
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Enforce 2FA</p>
                <p className="text-sm text-muted-foreground">
                  Require two-factor authentication for all system administrators
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Audit Trail</p>
                <p className="text-sm text-muted-foreground">
                  Monitor system administrator actions through audit logs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Admin Dialog */}
      <AlertDialog open={removeAdminOpen} onOpenChange={setRemoveAdminOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke System Administrator Privileges</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke system administrator privileges from{' '}
              <span className="font-medium">{adminToRemove?.name || adminToRemove?.email}</span>?
              They will lose all platform-wide administrative access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAdmin} disabled={removing}>
              {removing ? 'Revoking...' : 'Revoke Privileges'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}