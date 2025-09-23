"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronRight, Search, GripVertical } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface DropdownOption {
  id: string;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

interface Dropdown {
  id: string;
  name: string;
  key: string;
  description: string;
  options: DropdownOption[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function GlobalDropdownsPage() {
  const [dropdowns, setDropdowns] = useState<Dropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageOptionsOpen, setIsManageOptionsOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState<Dropdown | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    isActive: true,
  });
  const [optionsText, setOptionsText] = useState("");
  const [currentOptions, setCurrentOptions] = useState<DropdownOption[]>([]);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockDropdowns: Dropdown[] = [
      {
        id: "1",
        name: "Incident Severity",
        key: "incident_severity",
        description: "Standard incident severity levels",
        options: [
          { id: "1-1", value: "critical", label: "Critical", order: 1, isActive: true },
          { id: "1-2", value: "high", label: "High", order: 2, isActive: true },
          { id: "1-3", value: "medium", label: "Medium", order: 3, isActive: true },
          { id: "1-4", value: "low", label: "Low", order: 4, isActive: true },
        ],
        isActive: true,
        usageCount: 156,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Asset Types",
        key: "asset_types",
        description: "Types of assets in the organization",
        options: [
          { id: "2-1", value: "hardware", label: "Hardware", order: 1, isActive: true },
          { id: "2-2", value: "software", label: "Software", order: 2, isActive: true },
          { id: "2-3", value: "service", label: "Service", order: 3, isActive: true },
          { id: "2-4", value: "people", label: "People", order: 4, isActive: true },
          { id: "2-5", value: "data", label: "Data", order: 5, isActive: true },
        ],
        isActive: true,
        usageCount: 89,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-10",
      },
      {
        id: "3",
        name: "Incident Status",
        key: "incident_status",
        description: "Status options for incidents",
        options: [
          { id: "3-1", value: "open", label: "Open", order: 1, isActive: true },
          { id: "3-2", value: "in_progress", label: "In Progress", order: 2, isActive: true },
          { id: "3-3", value: "resolved", label: "Resolved", order: 3, isActive: true },
          { id: "3-4", value: "closed", label: "Closed", order: 4, isActive: true },
        ],
        isActive: true,
        usageCount: 234,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-20",
      },
    ];
    setDropdowns(mockDropdowns);
  }, []);

  const filteredDropdowns = dropdowns.filter((dropdown) => {
    return (
      dropdown.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dropdown.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dropdown.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const parseOptionsText = (text: string): DropdownOption[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.map((line, index) => {
      const [value, label] = line.split("|").map((s) => s.trim());
      return {
        id: Date.now().toString() + "-" + index,
        value: value || line.trim().toLowerCase().replace(/\s+/g, "_"),
        label: label || line.trim(),
        order: index + 1,
        isActive: true,
      };
    });
  };

  const handleCreate = () => {
    const options = parseOptionsText(optionsText);
    const newDropdown: Dropdown = {
      id: Date.now().toString(),
      ...formData,
      options,
      usageCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setDropdowns([...dropdowns, newDropdown]);
    setIsCreateDialogOpen(false);
    setFormData({ name: "", key: "", description: "", isActive: true });
    setOptionsText("");
    toast({
      title: "Dropdown created",
      description: "Global dropdown has been created successfully.",
    });
  };

  const handleUpdate = () => {
    if (!selectedDropdown) return;

    const updatedDropdowns = dropdowns.map((d) =>
      d.id === selectedDropdown.id
        ? {
            ...d,
            ...formData,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : d
    );
    setDropdowns(updatedDropdowns);
    setIsEditDialogOpen(false);
    setSelectedDropdown(null);
    toast({
      title: "Dropdown updated",
      description: "Global dropdown has been updated successfully.",
    });
  };

  const handleUpdateOptions = () => {
    if (!selectedDropdown) return;

    const updatedDropdowns = dropdowns.map((d) =>
      d.id === selectedDropdown.id
        ? {
            ...d,
            options: currentOptions,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : d
    );
    setDropdowns(updatedDropdowns);
    setIsManageOptionsOpen(false);
    toast({
      title: "Options updated",
      description: "Dropdown options have been updated successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setDropdowns(dropdowns.filter((d) => d.id !== id));
    toast({
      title: "Dropdown deleted",
      description: "Global dropdown has been deleted.",
    });
  };

  const openEditDialog = (dropdown: Dropdown) => {
    setSelectedDropdown(dropdown);
    setFormData({
      name: dropdown.name,
      key: dropdown.key,
      description: dropdown.description,
      isActive: dropdown.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openManageOptions = (dropdown: Dropdown) => {
    setSelectedDropdown(dropdown);
    setCurrentOptions([...dropdown.options]);
    setIsManageOptionsOpen(true);
  };

  const addOption = () => {
    const newOption: DropdownOption = {
      id: Date.now().toString(),
      value: "",
      label: "",
      order: currentOptions.length + 1,
      isActive: true,
    };
    setCurrentOptions([...currentOptions, newOption]);
  };

  const updateOption = (id: string, field: keyof DropdownOption, value: any) => {
    setCurrentOptions(
      currentOptions.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = (id: string) => {
    setCurrentOptions(currentOptions.filter((opt) => opt.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Dropdowns</h1>
          <p className="text-gray-600 mt-1">
            Manage system-wide dropdown options for consistency across organizations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dropdown
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Dropdowns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dropdowns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Dropdowns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dropdowns.filter((d) => d.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dropdowns.reduce((sum, d) => sum + d.options.length, 0)}
            </div>
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
              {dropdowns.reduce((sum, d) => sum + d.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dropdowns List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dropdown Library</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search dropdowns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDropdowns.map((dropdown) => (
                <TableRow key={dropdown.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dropdown.name}</div>
                      <div className="text-sm text-gray-500">{dropdown.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                      {dropdown.key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openManageOptions(dropdown)}
                    >
                      {dropdown.options.length} options
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                  <TableCell>{dropdown.usageCount}</TableCell>
                  <TableCell>
                    <Badge variant={dropdown.isActive ? "default" : "secondary"}>
                      {dropdown.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{dropdown.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(dropdown)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dropdown.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Global Dropdown</DialogTitle>
            <DialogDescription>
              Define a new dropdown list that organizations can use
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dropdown Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Incident Severity"
              />
            </div>
            <div>
              <Label>Key (for API usage)</Label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., incident_severity"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the dropdown"
              />
            </div>
            <div>
              <Label>Options (one per line)</Label>
              <Textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Enter options, one per line. Format: value|label or just label"
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: value|label (e.g., "critical|Critical") or just label
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
            <Button onClick={handleCreate}>Create Dropdown</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dropdown</DialogTitle>
            <DialogDescription>Update the dropdown details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dropdown Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Key</Label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <Button onClick={handleUpdate}>Update Dropdown</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Options Dialog */}
      <Dialog open={isManageOptionsOpen} onOpenChange={setIsManageOptionsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Options: {selectedDropdown?.name}</DialogTitle>
            <DialogDescription>Add, edit, or remove dropdown options</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {currentOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Input
                    value={option.value}
                    onChange={(e) => updateOption(option.id, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(option.id, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Switch
                    checked={option.isActive}
                    onCheckedChange={(checked) => updateOption(option.id, "isActive", checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={addOption} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageOptionsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOptions}>Save Options</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}