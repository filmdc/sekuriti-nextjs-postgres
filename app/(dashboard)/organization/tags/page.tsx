'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Tag,
  Plus,
  ChevronLeft,
  Search,
  Filter,
  Edit,
  Trash2,
  Merge,
  Shield,
  AlertTriangle,
  Settings,
  Hash,
  Palette,
  BarChart3,
  FileText,
  Target,
  MapPin,
  Building,
  Users,
  ShieldAlert
} from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  category: string;
  color: string;
  description?: string;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TagPolicy {
  id: number;
  entityType: string;
  requiredTags: string[];
  autoTags?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TagTemplate {
  id: number;
  name: string;
  description?: string;
  tags: string[];
  entityType?: string;
  isDefault: boolean;
  createdAt: string;
}

const tagCategories = [
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'department', label: 'Department', icon: Building },
  { value: 'criticality', label: 'Criticality', icon: ShieldAlert },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'incident_type', label: 'Incident Type', icon: AlertTriangle },
  { value: 'skill', label: 'Skill', icon: Users },
  { value: 'custom', label: 'Custom', icon: Tag }
];

const entityTypes = [
  { value: 'asset', label: 'Assets' },
  { value: 'incident', label: 'Incidents' },
  { value: 'runbook', label: 'Runbooks' },
  { value: 'communication', label: 'Communications' },
  { value: 'exercise', label: 'Exercises' }
];

const predefinedColors = [
  '#6B7280', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'
];

export default function TagGovernancePage() {
  const { toast } = useToast();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [policies, setPolicies] = useState<TagPolicy[]>([]);
  const [templates, setTemplates] = useState<TagTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<TagPolicy | null>(null);

  // Tag form state
  const [tagForm, setTagForm] = useState({
    name: '',
    category: 'custom',
    color: '#6B7280',
    description: ''
  });

  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    entityType: '',
    requiredTags: [] as string[],
    autoTags: {},
    isActive: true
  });

  // Merge form state
  const [mergeForm, setMergeForm] = useState({
    sourceTag: '',
    targetTag: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tagsResponse, policiesResponse, templatesResponse] = await Promise.all([
        fetch('/api/organization/tags'),
        fetch('/api/organization/tags/policies'),
        fetch('/api/organization/tags/templates')
      ]);

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setTags(tagsData);
      }

      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json();
        setPolicies(policiesData);
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tag data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    try {
      const response = await fetch('/api/organization/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tag created successfully'
        });
        setTagModalOpen(false);
        resetTagForm();
        fetchData();
      } else {
        throw new Error('Failed to create tag');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      const response = await fetch(`/api/organization/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tag updated successfully'
        });
        setTagModalOpen(false);
        resetTagForm();
        setSelectedTag(null);
        fetchData();
      } else {
        throw new Error('Failed to update tag');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tag',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      const response = await fetch(`/api/organization/tags/${selectedTag.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tag deleted successfully'
        });
        setDeleteDialogOpen(false);
        setSelectedTag(null);
        fetchData();
      } else {
        throw new Error('Failed to delete tag');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive'
      });
    }
  };

  const handleMergeTags = async () => {
    try {
      const response = await fetch('/api/organization/tags/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergeForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Tags merged successfully'
        });
        setMergeModalOpen(false);
        resetMergeForm();
        fetchData();
      } else {
        throw new Error('Failed to merge tags');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to merge tags',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch('/api/organization/tags/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyForm)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Policy created successfully'
        });
        setPolicyModalOpen(false);
        resetPolicyForm();
        fetchData();
      } else {
        throw new Error('Failed to create policy');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create policy',
        variant: 'destructive'
      });
    }
  };

  const handleTogglePolicy = async (policyId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/organization/tags/policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Policy ${isActive ? 'activated' : 'deactivated'} successfully`
        });
        fetchData();
      } else {
        throw new Error('Failed to update policy');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update policy',
        variant: 'destructive'
      });
    }
  };

  const resetTagForm = () => {
    setTagForm({
      name: '',
      category: 'custom',
      color: '#6B7280',
      description: ''
    });
  };

  const resetPolicyForm = () => {
    setPolicyForm({
      entityType: '',
      requiredTags: [],
      autoTags: {},
      isActive: true
    });
  };

  const resetMergeForm = () => {
    setMergeForm({
      sourceTag: '',
      targetTag: ''
    });
  };

  const openEditTagModal = (tag: TagItem) => {
    setSelectedTag(tag);
    setTagForm({
      name: tag.name,
      category: tag.category,
      color: tag.color,
      description: tag.description || ''
    });
    setTagModalOpen(true);
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = tagCategories.find(c => c.value === category);
    return cat?.icon || Tag;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tag Governance</h1>
            <p className="text-muted-foreground mt-1">
              Manage tags, policies, and ensure consistency
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMergeModalOpen(true)}>
            <Merge className="w-4 h-4 mr-2" />
            Merge Tags
          </Button>
          <Button onClick={() => setTagModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tag
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Tag className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{tags.length}</p>
                <p className="text-sm text-muted-foreground">Total Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {tags.reduce((sum, tag) => sum + tag.usageCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {policies.filter(p => p.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-sm text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tags">Tags ({tags.length})</TabsTrigger>
          <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {tagCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTags.map((tag) => {
              const CategoryIcon = getCategoryIcon(tag.category);
              return (
                <Card key={tag.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${tag.color}20` }}
                        >
                          <CategoryIcon className="h-5 w-5" style={{ color: tag.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tag.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {tag.category.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      {!tag.isSystem && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditTagModal(tag)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTag(tag);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {tag.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {tag.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {tag.usageCount} uses
                      </Badge>
                      {tag.isSystem && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setPolicyModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </Button>
          </div>

          {policies.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tag Policies</h3>
                <p className="text-muted-foreground mb-4">
                  Create policies to enforce tagging requirements
                </p>
                <Button onClick={() => setPolicyModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Policy
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {entityTypes.find(e => e.value === policy.entityType)?.label || policy.entityType} Policy
                          </h3>
                          <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Required tags: {policy.requiredTags.join(', ')}
                        </p>
                      </div>
                      <Switch
                        checked={policy.isActive}
                        onCheckedChange={(checked) => handleTogglePolicy(policy.id, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tag Templates</h3>
                <p className="text-muted-foreground">
                  Templates will appear here for quick tagging
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Tag Dialog */}
      <Dialog open={tagModalOpen} onOpenChange={(open) => {
        setTagModalOpen(open);
        if (!open) {
          resetTagForm();
          setSelectedTag(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTag ? 'Edit Tag' : 'Create New Tag'}
            </DialogTitle>
            <DialogDescription>
              {selectedTag ? 'Update tag details' : 'Add a new tag to your organization'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Name</Label>
              <Input
                id="tagName"
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                placeholder="e.g., Production, Critical"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagCategory">Category</Label>
              <Select
                value={tagForm.category}
                onValueChange={(value) => setTagForm({ ...tagForm, category: value })}
              >
                <SelectTrigger id="tagCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tagCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagColor">Color</Label>
              <div className="flex gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      tagForm.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setTagForm({ ...tagForm, color })}
                  />
                ))}
                <Input
                  type="color"
                  value={tagForm.color}
                  onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagDescription">Description (Optional)</Label>
              <Textarea
                id="tagDescription"
                value={tagForm.description}
                onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                placeholder="Describe when this tag should be used..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedTag ? handleUpdateTag : handleCreateTag}>
              {selectedTag ? 'Update Tag' : 'Create Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={policyModalOpen} onOpenChange={(open) => {
        setPolicyModalOpen(open);
        if (!open) resetPolicyForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tag Policy</DialogTitle>
            <DialogDescription>
              Define required tags for entity types
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select
                value={policyForm.entityType}
                onValueChange={(value) => setPolicyForm({ ...policyForm, entityType: value })}
              >
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Required Tag Categories</Label>
              <div className="space-y-2">
                {tagCategories.map(cat => (
                  <label key={cat.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={policyForm.requiredTags.includes(cat.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPolicyForm({
                            ...policyForm,
                            requiredTags: [...policyForm.requiredTags, cat.value]
                          });
                        } else {
                          setPolicyForm({
                            ...policyForm,
                            requiredTags: policyForm.requiredTags.filter(t => t !== cat.value)
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={policyForm.isActive}
                onCheckedChange={(checked) => setPolicyForm({ ...policyForm, isActive: checked })}
              />
              <Label htmlFor="isActive">Activate immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePolicy}>
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Tags Dialog */}
      <Dialog open={mergeModalOpen} onOpenChange={(open) => {
        setMergeModalOpen(open);
        if (!open) resetMergeForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Tags</DialogTitle>
            <DialogDescription>
              Combine two tags into one, updating all references
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sourceTag">Source Tag (will be removed)</Label>
              <Select
                value={mergeForm.sourceTag}
                onValueChange={(value) => setMergeForm({ ...mergeForm, sourceTag: value })}
              >
                <SelectTrigger id="sourceTag">
                  <SelectValue placeholder="Select source tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.filter(t => !t.isSystem).map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetTag">Target Tag (will be kept)</Label>
              <Select
                value={mergeForm.targetTag}
                onValueChange={(value) => setMergeForm({ ...mergeForm, targetTag: value })}
              >
                <SelectTrigger id="targetTag">
                  <SelectValue placeholder="Select target tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.filter(t => t.id.toString() !== mergeForm.sourceTag).map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMergeTags}>
              Merge Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag "{selectedTag?.name}"?
              This will remove it from all associated items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}