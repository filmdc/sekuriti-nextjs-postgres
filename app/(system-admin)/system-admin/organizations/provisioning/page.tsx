'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Copy,
  FileText,
  Database,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';

interface ProvisioningProfile {
  id: number;
  name: string;
  description: string;
  includeTemplates: boolean;
  includeDropdowns: boolean;
  includeTags: boolean;
  includeSettings: boolean;
  templateCount: number;
  dropdownCount: number;
  tagCount: number;
  isDefault: boolean;
  createdAt: string;
  usageCount: number;
}

export default function ProvisioningPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<ProvisioningProfile[]>([
    {
      id: 1,
      name: 'Standard Setup',
      description: 'Basic organization setup with essential templates and settings',
      includeTemplates: true,
      includeDropdowns: true,
      includeTags: true,
      includeSettings: false,
      templateCount: 12,
      dropdownCount: 8,
      tagCount: 15,
      isDefault: true,
      createdAt: '2024-01-01',
      usageCount: 45,
    },
    {
      id: 2,
      name: 'Enterprise Setup',
      description: 'Complete setup with all templates, settings, and customizations',
      includeTemplates: true,
      includeDropdowns: true,
      includeTags: true,
      includeSettings: true,
      templateCount: 25,
      dropdownCount: 15,
      tagCount: 30,
      isDefault: false,
      createdAt: '2024-01-15',
      usageCount: 12,
    },
    {
      id: 3,
      name: 'Minimal Setup',
      description: 'Lightweight setup for trial organizations',
      includeTemplates: true,
      includeDropdowns: false,
      includeTags: false,
      includeSettings: false,
      templateCount: 5,
      dropdownCount: 0,
      tagCount: 0,
      isDefault: false,
      createdAt: '2024-02-01',
      usageCount: 8,
    },
  ]);

  // Create/Edit profile dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProvisioningProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    includeTemplates: true,
    includeDropdowns: true,
    includeTags: true,
    includeSettings: false,
  });

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setProfileForm({
      name: '',
      description: '',
      includeTemplates: true,
      includeDropdowns: true,
      includeTags: true,
      includeSettings: false,
    });
    setDialogOpen(true);
  };

  const handleEditProfile = (profile: ProvisioningProfile) => {
    setEditingProfile(profile);
    setProfileForm({
      name: profile.name,
      description: profile.description,
      includeTemplates: profile.includeTemplates,
      includeDropdowns: profile.includeDropdowns,
      includeTags: profile.includeTags,
      includeSettings: profile.includeSettings,
    });
    setDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (!profileForm.name) {
      toast({
        title: 'Error',
        description: 'Profile name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingProfile) {
      // Update existing profile
      setProfiles(profiles.map(p =>
        p.id === editingProfile.id
          ? { ...p, ...profileForm }
          : p
      ));
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } else {
      // Create new profile
      const newProfile: ProvisioningProfile = {
        id: profiles.length + 1,
        ...profileForm,
        templateCount: profileForm.includeTemplates ? 10 : 0,
        dropdownCount: profileForm.includeDropdowns ? 8 : 0,
        tagCount: profileForm.includeTags ? 15 : 0,
        isDefault: false,
        createdAt: new Date().toISOString().split('T')[0],
        usageCount: 0,
      };
      setProfiles([...profiles, newProfile]);
      toast({
        title: 'Success',
        description: 'Profile created successfully',
      });
    }
    setDialogOpen(false);
  };

  const handleDeleteProfile = (profileId: number) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile?.isDefault) {
      toast({
        title: 'Error',
        description: 'Cannot delete the default profile',
        variant: 'destructive',
      });
      return;
    }

    setProfiles(profiles.filter(p => p.id !== profileId));
    toast({
      title: 'Success',
      description: 'Profile deleted successfully',
    });
  };

  const handleSetDefault = (profileId: number) => {
    setProfiles(profiles.map(p => ({
      ...p,
      isDefault: p.id === profileId,
    })));
    toast({
      title: 'Success',
      description: 'Default profile updated',
    });
  };

  const handleDuplicateProfile = (profile: ProvisioningProfile) => {
    const newProfile: ProvisioningProfile = {
      ...profile,
      id: profiles.length + 1,
      name: `${profile.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };
    setProfiles([...profiles, newProfile]);
    toast({
      title: 'Success',
      description: 'Profile duplicated successfully',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Provisioning Profiles</h2>
          <p className="text-muted-foreground">
            Configure default content and settings for new organizations
          </p>
        </div>
        <Button onClick={handleCreateProfile}>
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Default</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.find(p => p.isDefault)?.name || 'None'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.reduce((sum, p) => sum + p.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {profiles.sort((a, b) => b.usageCount - a.usageCount)[0]?.name || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provisioning Profiles</CardTitle>
          <CardDescription>
            Define what content and settings are included when creating new organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Included Content</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{profile.name}</p>
                        {profile.isDefault && (
                          <Badge className="bg-green-600">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {profile.includeTemplates && (
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {profile.templateCount} Templates
                        </Badge>
                      )}
                      {profile.includeDropdowns && (
                        <Badge variant="secondary">
                          <Database className="h-3 w-3 mr-1" />
                          {profile.dropdownCount} Dropdowns
                        </Badge>
                      )}
                      {profile.includeTags && (
                        <Badge variant="secondary">
                          <Layers className="h-3 w-3 mr-1" />
                          {profile.tagCount} Tags
                        </Badge>
                      )}
                      {profile.includeSettings && (
                        <Badge variant="secondary">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{profile.usageCount} times</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{profile.createdAt}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateProfile(profile)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!profile.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(profile.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {!profile.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Content Details */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
            <CardDescription>
              Templates that can be included in profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Incident Response Runbooks</span>
                <Badge variant="outline">15</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Communication Templates</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Training Scenarios</span>
                <Badge variant="outline">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Asset Templates</span>
                <Badge variant="outline">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Dropdowns</CardTitle>
            <CardDescription>
              Dropdown options for various fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Incident Types</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Severity Levels</span>
                <Badge variant="outline">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Asset Categories</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Threat Types</span>
                <Badge variant="outline">10</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Tags</CardTitle>
            <CardDescription>
              Default tags for organization entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Criticality Tags</span>
                <Badge variant="outline">4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compliance Tags</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Department Tags</span>
                <Badge variant="outline">10</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Location Tags</span>
                <Badge variant="outline">15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? 'Edit Profile' : 'Create Provisioning Profile'}
            </DialogTitle>
            <DialogDescription>
              Configure what content and settings to include in this profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="e.g., Standard Setup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-description">Description</Label>
              <Textarea
                id="profile-description"
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                placeholder="Describe what this profile includes..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Include Content</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Templates</Label>
                    <p className="text-sm text-muted-foreground">
                      Include runbooks and communication templates
                    </p>
                  </div>
                  <Switch
                    checked={profileForm.includeTemplates}
                    onCheckedChange={(checked) =>
                      setProfileForm({ ...profileForm, includeTemplates: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Global Dropdowns</Label>
                    <p className="text-sm text-muted-foreground">
                      Include dropdown options for forms
                    </p>
                  </div>
                  <Switch
                    checked={profileForm.includeDropdowns}
                    onCheckedChange={(checked) =>
                      setProfileForm({ ...profileForm, includeDropdowns: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default Tags</Label>
                    <p className="text-sm text-muted-foreground">
                      Include predefined tags for assets and incidents
                    </p>
                  </div>
                  <Switch
                    checked={profileForm.includeTags}
                    onCheckedChange={(checked) =>
                      setProfileForm({ ...profileForm, includeTags: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default Settings</Label>
                    <p className="text-sm text-muted-foreground">
                      Include system settings and configurations
                    </p>
                  </div>
                  <Switch
                    checked={profileForm.includeSettings}
                    onCheckedChange={(checked) =>
                      setProfileForm({ ...profileForm, includeSettings: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              {editingProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}