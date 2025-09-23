"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Search, Filter, Hash, RefreshCw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface DefaultTag {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  isActive: boolean;
  isMandatory: boolean;
  appliesTo: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const tagCategories = [
  "Security",
  "Compliance",
  "Operational",
  "Financial",
  "Technical",
  "Business",
];

const entityTypes = [
  "Incident",
  "Asset",
  "Runbook",
  "Communication",
  "Exercise",
  "Organization",
];

const colorOptions = [
  { value: "red", label: "Red", className: "bg-red-500" },
  { value: "orange", label: "Orange", className: "bg-orange-500" },
  { value: "yellow", label: "Yellow", className: "bg-yellow-500" },
  { value: "green", label: "Green", className: "bg-green-500" },
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "purple", label: "Purple", className: "bg-purple-500" },
  { value: "gray", label: "Gray", className: "bg-gray-500" },
];

export default function DefaultTagsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<DefaultTag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "blue",
    description: "",
    isActive: true,
    isMandatory: false,
    appliesTo: [] as string[],
  });
  const { toast } = useToast();

  // Fetch tags from API
  const { data, isLoading, mutate: refreshTags } = useAdminAPI<{ tags: DefaultTag[] }>(
    '/api/system-admin/tags/defaults'
  );

  const tags = data?.tags || [];


  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async () => {
    try {
      await adminAPI('/api/system-admin/tags/defaults', {
        method: 'POST',
        body: formData,
        successMessage: 'Default tag created successfully',
      });

      refreshTags();
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        category: "",
        color: "blue",
        description: "",
        isActive: true,
        isMandatory: false,
        appliesTo: [],
      });
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTag) return;

    try {
      await adminAPI(`/api/system-admin/tags/defaults/${selectedTag.id}`, {
        method: 'PUT',
        body: formData,
        successMessage: 'Default tag updated successfully',
      });

      refreshTags();
      setIsEditDialogOpen(false);
      setSelectedTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminAPI(`/api/system-admin/tags/defaults/${id}`, {
        method: 'DELETE',
        successMessage: 'Default tag deleted successfully',
      });

      refreshTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const openEditDialog = (tag: DefaultTag) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      category: tag.category,
      color: tag.color,
      description: tag.description,
      isActive: tag.isActive,
      isMandatory: tag.isMandatory,
      appliesTo: tag.appliesTo,
    });
    setIsEditDialogOpen(true);
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find((c) => c.value === color);
    return colorOption?.className || "bg-gray-500";
  };

  const toggleAppliesTo = (entity: string) => {
    setFormData((prev) => ({
      ...prev,
      appliesTo: prev.appliesTo.includes(entity)
        ? prev.appliesTo.filter((e) => e !== entity)
        : [...prev.appliesTo, entity],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Default Tags</h1>
          <p className="text-gray-600 mt-1">
            Define system-wide tags that organizations can use for categorization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refreshTags()}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mandatory Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.filter((t) => t.isMandatory).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.reduce((sum, t) => sum + t.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tag Library</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tags..."
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
                  {tagCategories.map((cat) => (
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
                <TableHead>Tag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading tags...
                  </TableCell>
                </TableRow>
              ) : filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No tags found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getColorClass(tag.color)}`} />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{tag.description}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tag.appliesTo.map((entity) => (
                        <Badge key={entity} variant="secondary" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{tag.usageCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tag.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {tag.isMandatory && (
                        <Badge variant="destructive" className="text-xs">
                          Mandatory
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tag.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
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
            <DialogTitle>Create Default Tag</DialogTitle>
            <DialogDescription>
              Define a new tag that organizations can use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tag Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Critical"
                />
              </div>
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
                    {tagCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the tag"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-8 w-8 rounded-full ${color.className} ${
                      formData.color === color.value
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Applies To</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {entityTypes.map((entity) => (
                  <Button
                    key={entity}
                    type="button"
                    variant={formData.appliesTo.includes(entity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAppliesTo(entity)}
                  >
                    {entity}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isMandatory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMandatory: checked })
                  }
                />
                <Label>Mandatory (organizations must use this tag)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Default Tag</DialogTitle>
            <DialogDescription>Update the tag details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tag Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
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
                    {tagCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-8 w-8 rounded-full ${color.className} ${
                      formData.color === color.value
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Applies To</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {entityTypes.map((entity) => (
                  <Button
                    key={entity}
                    type="button"
                    variant={formData.appliesTo.includes(entity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAppliesTo(entity)}
                  >
                    {entity}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isMandatory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isMandatory: checked })
                  }
                />
                <Label>Mandatory</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}