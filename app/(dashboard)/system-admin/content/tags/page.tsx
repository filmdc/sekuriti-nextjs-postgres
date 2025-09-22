import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Tag, Hash, AlertCircle, Palette, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TagsPage() {
  // Placeholder tag data
  const systemTags = [
    {
      id: 1,
      name: 'PII',
      category: 'Data Classification',
      color: 'red',
      description: 'Personally Identifiable Information',
      usageCount: 1234,
      appliedTo: ['Assets', 'Incidents', 'Documents'],
      protected: true,
      createdBy: 'System',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Critical',
      category: 'Severity',
      color: 'red',
      description: 'Critical priority items',
      usageCount: 456,
      appliedTo: ['Assets', 'Incidents'],
      protected: true,
      createdBy: 'System',
      createdAt: '2024-01-15',
    },
    {
      id: 3,
      name: 'Production',
      category: 'Environment',
      color: 'green',
      description: 'Production environment resources',
      usageCount: 789,
      appliedTo: ['Assets', 'Services'],
      protected: false,
      createdBy: 'Admin',
      createdAt: '2024-02-20',
    },
    {
      id: 4,
      name: 'GDPR',
      category: 'Compliance',
      color: 'blue',
      description: 'GDPR compliance requirement',
      usageCount: 234,
      appliedTo: ['Assets', 'Processes'],
      protected: true,
      createdBy: 'System',
      createdAt: '2024-01-15',
    },
  ];

  const tagCategories = [
    { name: 'Data Classification', count: 8, color: 'red' },
    { name: 'Severity', count: 5, color: 'orange' },
    { name: 'Environment', count: 6, color: 'green' },
    { name: 'Compliance', count: 12, color: 'blue' },
    { name: 'Department', count: 15, color: 'purple' },
    { name: 'Custom', count: 23, color: 'gray' },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tag Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide tags and taxonomies for organization and classification
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Tag management functionality will be available soon.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">69</div>
            <p className="text-xs text-muted-foreground">System-wide tags</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Tag categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,147</div>
            <p className="text-xs text-muted-foreground">Tagged items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Protected Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">System-protected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Tags</CardTitle>
                  <CardDescription>Manage tags available across all organizations</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Search tags
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search tags..."
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {tagCategories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Applied To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getColorClasses(tag.color)}>
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{tag.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            {tag.usageCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tag.appliedTo.slice(0, 2).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                            {tag.appliedTo.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tag.appliedTo.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tag.protected ? (
                            <Badge variant="secondary">
                              <Shield className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" disabled={tag.protected}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled={tag.protected}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tag Categories</CardTitle>
              <CardDescription>Organize tags by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tagCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.count} tags</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tag Rules</CardTitle>
              <CardDescription>Configure tagging policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Require Tags</div>
                    <div className="text-sm text-muted-foreground">
                      All items must have at least one tag
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-Tagging</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically apply tags based on rules
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Tag Inheritance</div>
                    <div className="text-sm text-muted-foreground">
                      Child items inherit parent tags
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Define tag colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'].map((color) => (
                  <button
                    key={color}
                    className={`w-full h-8 rounded border-2 border-transparent hover:border-gray-400 bg-${color}-500`}
                    title={color}
                  />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Palette className="h-4 w-4 mr-2" />
                Customize Colors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}