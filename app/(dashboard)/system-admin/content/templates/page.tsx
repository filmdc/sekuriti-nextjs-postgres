'use client';

import { useState } from 'react';
import { useTemplates, useTemplateManagement } from '@/lib/hooks/useTemplates';
import { TemplateEditor } from '@/components/communications/TemplateEditor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Save,
  Search,
  FileText,
  MessageSquare,
  Star,
  Clock,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TemplatesManagementPage() {
  const [activeTab, setActiveTab] = useState<'communication' | 'runbook'>('communication');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch templates for active tab
  const {
    templates,
    systemTemplates,
    orgTemplates,
    isLoading,
    error,
    refresh
  } = useTemplates(activeTab, {
    search,
    category: category !== 'all' ? category : undefined,
    includeSystem: true,
  });

  const {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    toggleFavorite
  } = useTemplateManagement(activeTab);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subject: '',
    content: '',
    tags: [] as string[],
    isDefault: false,
  });

  const handleCreate = () => {
    setFormData({
      title: '',
      category: '',
      subject: '',
      content: '',
      tags: [],
      isDefault: false,
    });
    setEditingTemplate(null);
    setIsCreating(true);
  };

  const handleEdit = (template: any) => {
    setFormData({
      title: template.title,
      category: template.category,
      subject: template.subject || '',
      content: template.content,
      tags: template.tags || [],
      isDefault: template.isDefault || false,
    });
    setEditingTemplate(template);
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.category || !formData.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }

      refresh();
      setIsCreating(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
      refresh();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleClone = async (id: number) => {
    try {
      await cloneTemplate(id);
      refresh();
    } catch (error) {
      console.error('Error cloning template:', error);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await toggleFavorite(id);
      refresh();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const communicationCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'initial', label: 'Initial Response' },
    { value: 'status_update', label: 'Status Update' },
    { value: 'resolution', label: 'Resolution' },
    { value: 'stakeholder', label: 'Stakeholder' },
    { value: 'technical', label: 'Technical' },
    { value: 'executive', label: 'Executive' },
  ];

  const runbookCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'incident_response', label: 'Incident Response' },
    { value: 'disaster_recovery', label: 'Disaster Recovery' },
    { value: 'security', label: 'Security' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'operational', label: 'Operational' },
  ];

  const categories = activeTab === 'communication' ? communicationCategories : runbookCategories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Management</h2>
          <p className="text-muted-foreground">
            Manage system and organization templates
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Tabs for Template Types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="communication">
            <MessageSquare className="h-4 w-4 mr-2" />
            Communication Templates
          </TabsTrigger>
          <TabsTrigger value="runbook">
            <FileText className="h-4 w-4 mr-2" />
            Runbook Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                {templates.length} templates found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : error ? (
                <p className="text-center py-8 text-muted-foreground">
                  Failed to load templates. Please try again.
                </p>
              ) : templates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No templates found. Create your first template to get started.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.title}</span>
                            {template.isFavorite && (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {!template.organizationId ? (
                            <Badge variant="secondary">System</Badge>
                          ) : (
                            <Badge>Organization</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {template.usageCount || 0} uses
                        </TableCell>
                        <TableCell>
                          {format(new Date(template.updatedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleFavorite(template.id)}
                            >
                              <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleClone(template.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {template.organizationId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Sheet */}
      <Sheet open={isCreating} onOpenChange={setIsCreating}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </SheetTitle>
            <SheetDescription>
              {activeTab === 'communication'
                ? 'Create a communication template for incident responses'
                : 'Create a runbook template for standard procedures'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter template title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === 'communication' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Email subject (optional)"
                />
              </div>
            )}

            <div className="space-y-2">
              <TemplateEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                variables={
                  activeTab === 'communication'
                    ? {
                        incident: [
                          { key: 'incident.id', label: 'Incident ID', example: 'INC-001' },
                          { key: 'incident.title', label: 'Incident Title', example: 'Data breach detected' },
                          { key: 'incident.severity', label: 'Severity', example: 'Critical' },
                          { key: 'incident.status', label: 'Status', example: 'Contained' },
                        ],
                        organization: [
                          { key: 'org.name', label: 'Organization Name', example: 'Acme Corp' },
                          { key: 'org.contact', label: 'Contact Email', example: 'security@acme.com' },
                        ],
                      }
                    : undefined
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              />
              <Label htmlFor="isDefault">Make this a system template</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}