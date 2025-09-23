"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, Search, Filter, RefreshCw } from "lucide-react";
import { useAdminAPI, adminAPI } from '@/lib/hooks/use-admin-api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface Template {
  id: string;
  name: string;
  category: string;
  type: string;
  content: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const templateCategories = [
  "Incident Response",
  "Communication",
  "Runbook",
  "Exercise",
  "Report",
  "Policy",
];

const templateTypes = [
  "Email",
  "SMS",
  "Slack",
  "Document",
  "Checklist",
  "Form",
];

export default function SystemTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    content: "",
    isActive: true,
  });
  const { toast } = useToast();

  // Fetch templates from API
  const { data, isLoading, mutate: refreshTemplates } = useAdminAPI<{ templates: Template[] }>(
    '/api/system-admin/content/templates'
  );

  const templates = data?.templates || [];


  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handleCreate = async () => {
    try {
      const newTemplate = {
        ...formData,
        variables: extractVariables(formData.content),
      };

      await adminAPI('/api/system-admin/content/templates', {
        method: 'POST',
        body: newTemplate,
        successMessage: 'Template created successfully',
      });

      refreshTemplates();
      setIsCreateDialogOpen(false);
      setFormData({ name: "", category: "", type: "", content: "", isActive: true });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplate = {
        ...formData,
        variables: extractVariables(formData.content),
      };

      await adminAPI(`/api/system-admin/content/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        body: updatedTemplate,
        successMessage: 'Template updated successfully',
      });

      refreshTemplates();
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI(`/api/system-admin/content/templates/${id}`, {
        method: 'DELETE',
        successMessage: 'Template deleted successfully',
      });

      refreshTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
      };
      delete duplicatedTemplate.id;
      delete duplicatedTemplate.createdAt;
      delete duplicatedTemplate.updatedAt;
      delete duplicatedTemplate.usageCount;

      await adminAPI('/api/system-admin/content/templates', {
        method: 'POST',
        body: duplicatedTemplate,
        successMessage: 'Template duplicated successfully',
      });

      refreshTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const openEditDialog = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      type: template.type,
      content: template.content,
      isActive: template.isActive,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage reusable templates for incidents, communications, and runbooks
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refreshTemplates()}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates Library</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {templateCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading templates...
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.category}</Badge>
                  </TableCell>
                  <TableCell>{template.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v) => (
                        <Badge key={v} variant="secondary" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create System Template</DialogTitle>
            <DialogDescription>
              Create a reusable template that organizations can use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Critical Incident Response"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Template Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter template content. Use {{variable_name}} for variables."
                rows={8}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {"{{variable_name}}"} syntax to define variables
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit System Template</DialogTitle>
            <DialogDescription>
              Update the template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Template Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}