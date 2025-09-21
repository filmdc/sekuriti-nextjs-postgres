'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AssetGroupTree } from '@/components/assets/asset-group-tree';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { updateAssetGroupAction, deleteAssetGroupAction } from '@/lib/actions/assets';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AssetGroup } from '@/lib/db/schema-tags';

interface AssetGroupWithChildren extends AssetGroup {
  children?: AssetGroupWithChildren[];
  members?: any[];
}

interface AssetGroupsClientProps {
  groups: AssetGroupWithChildren[];
}

export function AssetGroupsClient({ groups }: AssetGroupsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedGroup, setSelectedGroup] = useState<AssetGroupWithChildren | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEditGroup = (group: AssetGroup) => {
    setSelectedGroup(group as AssetGroupWithChildren);
    setEditDialogOpen(true);
  };

  const handleDeleteGroup = (groupId: number) => {
    const group = findGroupById(groups, groupId);
    if (group) {
      setSelectedGroup(group);
      setDeleteDialogOpen(true);
    }
  };

  const handleCreateSubgroup = (parentId: number | null) => {
    // Navigate to new group page with parent ID
    if (parentId) {
      router.push(`/assets/groups/new?parent=${parentId}`);
    } else {
      router.push('/assets/groups/new');
    }
  };

  const findGroupById = (
    groups: AssetGroupWithChildren[],
    id: number
  ): AssetGroupWithChildren | null => {
    for (const group of groups) {
      if (group.id === id) return group;
      if (group.children) {
        const found = findGroupById(group.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleUpdateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateAssetGroupAction(selectedGroup.id, formData);
      setEditDialogOpen(false);
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;

    startTransition(async () => {
      await deleteAssetGroupAction(selectedGroup.id);
      setDeleteDialogOpen(false);
    });
  };

  // Flatten groups for display
  const flattenGroups = (groups: AssetGroupWithChildren[]): AssetGroupWithChildren[] => {
    const result: AssetGroupWithChildren[] = [];
    const processGroup = (group: AssetGroupWithChildren, level = 0) => {
      result.push({ ...group, sortOrder: level });
      if (group.children) {
        group.children.forEach(child => processGroup(child, level + 1));
      }
    };
    groups.forEach(group => processGroup(group));
    return result;
  };

  const flatGroups = flattenGroups(groups);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-12">
        {/* Groups Tree */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Group Hierarchy</CardTitle>
            <CardDescription>
              Click on a group to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetGroupTree
              groups={groups}
              selectedGroupId={selectedGroup?.id}
              onSelectGroup={(groupId) => {
                const group = groupId ? findGroupById(groups, groupId) : null;
                setSelectedGroup(group);
              }}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroup}
              onCreateSubgroup={handleCreateSubgroup}
            />
          </CardContent>
        </Card>

        {/* Group Details */}
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroup ? (
              <div className="space-y-6">
                {/* Group Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {selectedGroup.icon && <span>{selectedGroup.icon}</span>}
                        {selectedGroup.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedGroup.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {selectedGroup.type}
                      </Badge>
                      {selectedGroup.isDynamic && (
                        <Badge variant="outline">Dynamic</Badge>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Members</p>
                      <p className="text-2xl font-bold">{selectedGroup.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subgroups</p>
                      <p className="text-2xl font-bold">{selectedGroup.children?.length || 0}</p>
                    </div>
                  </div>

                  {/* Dynamic Rules */}
                  {selectedGroup.isDynamic && selectedGroup.rules && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-medium">Dynamic Rules</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(selectedGroup.rules, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGroup(selectedGroup)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Group
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateSubgroup(selectedGroup.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subgroup
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(selectedGroup.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a group to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateGroup}>
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Update the group details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedGroup?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedGroup?.description || ''}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select name="type" defaultValue={selectedGroup?.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logical">Logical</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-icon">Icon (Emoji)</Label>
                  <Input
                    id="edit-icon"
                    name="icon"
                    defaultValue={selectedGroup?.icon || ''}
                    placeholder="📁"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input
                    id="edit-color"
                    name="color"
                    type="color"
                    defaultValue={selectedGroup?.color || '#6B7280'}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.
              {selectedGroup?.memberCount && selectedGroup.memberCount > 0 && (
                <span className="block mt-2 text-orange-600">
                  Warning: This group contains {selectedGroup.memberCount} assets.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}