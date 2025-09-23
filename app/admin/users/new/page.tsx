'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserPlus, Building2, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface Organization {
  id: number;
  name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    isSystemAdmin: false,
    assignToTeam: false,
    teamId: '',
    role: 'member',
  });

  // Load organizations for team assignment
  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/system-admin/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  // Load organizations when component mounts
  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const createData = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        isSystemAdmin: formData.isSystemAdmin,
        ...(formData.assignToTeam && formData.teamId && {
          teamId: parseInt(formData.teamId),
          role: formData.role,
        }),
      };

      const response = await fetch('/api/system-admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      router.push('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600">Add a new user to the platform</p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>
              Enter the basic information for the new user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* System Admin Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-500" />
                  <div>
                    <Label htmlFor="isSystemAdmin" className="text-base font-medium">
                      System Administrator
                    </Label>
                    <p className="text-sm text-gray-600">
                      Grant full system administration privileges
                    </p>
                  </div>
                </div>
                <Switch
                  id="isSystemAdmin"
                  checked={formData.isSystemAdmin}
                  onCheckedChange={(checked) => handleInputChange('isSystemAdmin', checked)}
                />
              </div>

              {/* Team Assignment */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="assignToTeam" className="text-base font-medium">
                        Assign to Organization
                      </Label>
                      <p className="text-sm text-gray-600">
                        Optionally assign user to an organization
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="assignToTeam"
                    checked={formData.assignToTeam}
                    onCheckedChange={(checked) => handleInputChange('assignToTeam', checked)}
                  />
                </div>

                {formData.assignToTeam && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamId">Organization</Label>
                      <Select value={formData.teamId} onValueChange={(value) => handleInputChange('teamId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Link href="/admin/users">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}