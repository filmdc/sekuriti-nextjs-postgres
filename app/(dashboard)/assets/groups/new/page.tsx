import { getUser } from '@/lib/db/queries';
import { getAssetGroupsFlat } from '@/lib/db/queries-groups';
import { createAssetGroupAction } from '@/lib/actions/assets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function NewAssetGroupPage({
  searchParams
}: {
  searchParams: { parent?: string };
}) {
  const user = await getUser();
  if (!user?.teamId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to create asset groups</p>
      </div>
    );
  }

  const groups = await getAssetGroupsFlat(user.teamId);
  const parentId = searchParams.parent ? parseInt(searchParams.parent) : undefined;
  const parentGroup = parentId ? groups.find(g => g.id === parentId) : undefined;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/assets/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Asset Group</h2>
          <p className="text-muted-foreground">
            Create a new group to organize your assets
            {parentGroup && ` under ${parentGroup.name}`}
          </p>
        </div>
      </div>

      <form action={createAssetGroupAction}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the group's identity and purpose
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Production Servers, US Office"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select name="type" defaultValue="custom" required>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of this group..."
                  rows={3}
                />
              </div>

              {parentId && (
                <input type="hidden" name="parentGroupId" value={parentId} />
              )}

              {!parentId && groups.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="parentGroupId">Parent Group (Optional)</Label>
                  <Select name="parentGroupId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top Level)</SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the group appears
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="📁"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Use an emoji to represent this group
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue="#6B7280"
                    className="w-20"
                  />
                  <Input
                    type="text"
                    defaultValue="#6B7280"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                    onChange={(e) => {
                      const colorInput = document.getElementById('color') as HTMLInputElement;
                      if (colorInput && e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        colorInput.value = e.target.value;
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Dynamic Rules
              </CardTitle>
              <CardDescription>
                Automatically populate this group based on rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="isDynamic" name="isDynamic" value="true" />
                <Label htmlFor="isDynamic" className="font-normal">
                  Make this a dynamic group
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Rules Configuration</Label>
                <Textarea
                  name="rules"
                  placeholder={`{
  "assetType": "hardware",
  "criticality": "critical",
  "mustContact": true
}`}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define rules in JSON format. Assets matching these rules will be automatically added.
                </p>
              </div>

              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Available Rule Fields:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• <code>assetType</code>: hardware, software, service, data, etc.</li>
                  <li>• <code>criticality</code>: low, medium, high, critical</li>
                  <li>• <code>mustContact</code>: true or false</li>
                  <li>• <code>tags</code>: Array of tag IDs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/assets/groups">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </form>
    </div>
  );
}