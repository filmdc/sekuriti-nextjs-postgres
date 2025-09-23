'use client';

import { useState } from 'react';
import { useDropdowns, useDropdownManagement } from '@/lib/hooks/useDropdowns';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  List,
  Hash,
  ToggleLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
}

export function DropdownManager() {
  const { dropdowns, isLoading, error, refresh } = useDropdowns();
  const { createDropdown, updateDropdown, deleteDropdown } = useDropdownManagement();

  const [selectedDropdown, setSelectedDropdown] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<{ dropdownId: string; index: number } | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    options: [] as DropdownOption[],
  });

  const [newOption, setNewOption] = useState<DropdownOption>({
    value: '',
    label: '',
    description: '',
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedDropdowns);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDropdowns(newExpanded);
  };

  const startEdit = (dropdown: any) => {
    setSelectedDropdown(dropdown);
    setFormData({
      name: dropdown.name,
      key: dropdown.key,
      description: dropdown.description || '',
      options: dropdown.options || [],
    });
    setIsEditing(true);
  };

  const startCreate = () => {
    setSelectedDropdown(null);
    setFormData({
      name: '',
      key: '',
      description: '',
      options: [],
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.key) {
        toast.error('Name and key are required');
        return;
      }

      if (selectedDropdown) {
        // Update existing
        await updateDropdown(selectedDropdown.id, formData);
      } else {
        // Create new
        await createDropdown(formData);
      }

      refresh();
      setIsEditing(false);
      setSelectedDropdown(null);
    } catch (error) {
      console.error('Error saving dropdown:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDropdown(id);
      refresh();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting dropdown:', error);
    }
  };

  const addOption = () => {
    if (!newOption.value || !newOption.label) {
      toast.error('Value and label are required');
      return;
    }

    setFormData({
      ...formData,
      options: [...formData.options, { ...newOption }],
    });
    setNewOption({ value: '', label: '', description: '' });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, option: DropdownOption) => {
    const newOptions = [...formData.options];
    newOptions[index] = option;
    setFormData({ ...formData, options: newOptions });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Failed to load dropdowns. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const systemDropdowns = dropdowns.filter(d => d.isSystem);
  const customDropdowns = dropdowns.filter(d => !d.isSystem);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dropdown Management</h2>
          <p className="text-muted-foreground">
            Configure dropdown options used throughout the platform
          </p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Dropdown
        </Button>
      </div>

      {/* System Dropdowns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Dropdowns</CardTitle>
          <CardDescription>
            Built-in dropdowns that cannot be deleted but can be customized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {systemDropdowns.map((dropdown) => (
              <div
                key={dropdown.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpanded(dropdown.id)}
                      className="p-1 hover:bg-accent rounded"
                    >
                      {expandedDropdowns.has(dropdown.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dropdown.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {dropdown.key}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      </div>
                      {dropdown.description && (
                        <p className="text-sm text-muted-foreground">
                          {dropdown.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dropdown.options.length} options
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(dropdown)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedDropdowns.has(dropdown.id) && (
                  <div className="ml-8 mt-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Value</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dropdown.options.map((option: DropdownOption, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {option.value}
                            </TableCell>
                            <TableCell>{option.label}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {option.description || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Dropdowns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Dropdowns</CardTitle>
          <CardDescription>
            Organization-specific dropdowns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customDropdowns.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No custom dropdowns yet. Create your first dropdown to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {customDropdowns.map((dropdown) => (
                <div
                  key={dropdown.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpanded(dropdown.id)}
                        className="p-1 hover:bg-accent rounded"
                      >
                        {expandedDropdowns.has(dropdown.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dropdown.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {dropdown.key}
                          </Badge>
                          {!dropdown.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {dropdown.description && (
                          <p className="text-sm text-muted-foreground">
                            {dropdown.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {dropdown.options.length} options
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(dropdown)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(dropdown.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedDropdowns.has(dropdown.id) && (
                    <div className="ml-8 mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Value</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dropdown.options.map((option: DropdownOption, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm">
                                {option.value}
                              </TableCell>
                              <TableCell>{option.label}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {option.description || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedDropdown ? 'Edit Dropdown' : 'Create Dropdown'}
            </SheetTitle>
            <SheetDescription>
              Configure the dropdown properties and options
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Incident Severity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., incident_severity"
                  disabled={!!selectedDropdown}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier used in the system (cannot be changed)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this dropdown"
                  rows={2}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div>
                <Label>Options</Label>
                <p className="text-sm text-muted-foreground">
                  Define the available options for this dropdown
                </p>
              </div>

              {/* Existing Options */}
              {formData.options.length > 0 && (
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{option.value}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{option.label}</span>
                        </div>
                        {option.description && (
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Option */}
              <div className="space-y-2 p-4 border rounded-lg bg-accent/50">
                <Label>Add Option</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Value"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  />
                  <Input
                    placeholder="Label"
                    value={newOption.label}
                    onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newOption.description}
                  onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                />
                <Button onClick={addOption} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Dropdown
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dropdown</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dropdown? This action cannot be undone
              and may affect forms using these options.
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