'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Hash,
  Palette,
  Shield,
  TrendingUp,
  AlertCircle,
  Merge
} from 'lucide-react'

const mockTags = [
  {
    id: 1,
    name: 'critical-infrastructure',
    displayName: 'Critical Infrastructure',
    color: '#ef4444',
    category: 'system',
    usage: 342,
    entities: ['assets', 'incidents'],
    system: true,
  },
  {
    id: 2,
    name: 'pci-compliance',
    displayName: 'PCI Compliance',
    color: '#8b5cf6',
    category: 'compliance',
    usage: 189,
    entities: ['assets', 'runbooks'],
    system: false,
  },
  {
    id: 3,
    name: 'production',
    displayName: 'Production',
    color: '#10b981',
    category: 'environment',
    usage: 567,
    entities: ['assets', 'incidents', 'runbooks'],
    system: true,
  },
  {
    id: 4,
    name: 'customer-data',
    displayName: 'Customer Data',
    color: '#f59e0b',
    category: 'data',
    usage: 234,
    entities: ['assets'],
    system: false,
  },
  {
    id: 5,
    name: 'high-priority',
    displayName: 'High Priority',
    color: '#dc2626',
    category: 'priority',
    usage: 445,
    entities: ['incidents', 'runbooks'],
    system: true,
  },
]

const tagCategories = [
  { value: 'system', label: 'System', color: '#3b82f6' },
  { value: 'compliance', label: 'Compliance', color: '#8b5cf6' },
  { value: 'environment', label: 'Environment', color: '#10b981' },
  { value: 'data', label: 'Data Classification', color: '#f59e0b' },
  { value: 'priority', label: 'Priority', color: '#dc2626' },
  { value: 'custom', label: 'Custom', color: '#6b7280' },
]

const entities = [
  { value: 'assets', label: 'Assets' },
  { value: 'incidents', label: 'Incidents' },
  { value: 'runbooks', label: 'Runbooks' },
  { value: 'users', label: 'Users' },
  { value: 'teams', label: 'Teams' },
]

export default function ContentTagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Tags</h1>
          <p className="text-muted-foreground mt-2">
            Manage system-wide tags and categorization
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTags.length}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Tags</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTags.filter(t => t.system).length}
            </div>
            <p className="text-xs text-muted-foreground">Protected tags</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTags.reduce((acc, t) => acc + t.usage, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Tag applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tagCategories.length}</div>
            <p className="text-xs text-muted-foreground">Tag groups</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tags">All Tags</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Tagging Rules</TabsTrigger>
          <TabsTrigger value="merge">Merge & Cleanup</TabsTrigger>
        </TabsList>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tag Management</CardTitle>
              <CardDescription>
                System-wide tags for categorization and organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Search tags..." className="max-w-sm" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {tagCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Applied To</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTags.map((tag) => {
                    const category = tagCategories.find(c => c.value === tag.category)
                    return (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tag.color }}
                            />
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {tag.name}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tag.displayName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: category?.color }}>
                            {category?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {tag.entities.map((entity) => (
                              <Badge key={entity} variant="secondary" className="text-xs">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{tag.usage}</TableCell>
                        <TableCell>
                          {tag.system ? (
                            <Badge variant="outline" className="text-blue-600">
                              <Shield className="h-3 w-3 mr-1" />
                              System
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Custom</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              disabled={tag.system}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tag Categories</CardTitle>
              <CardDescription>
                Organize tags into logical groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {tagCategories.map((category) => {
                  const tags = mockTags.filter(t => t.category === category.value)
                  const usage = tags.reduce((acc, t) => acc + t.usage, 0)
                  return (
                    <div key={category.value} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: category.color }}
                          />
                          <h4 className="font-medium">{category.label}</h4>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tags:</span>
                          <span>{tags.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total usage:</span>
                          <span>{usage.toLocaleString()}</span>
                        </div>
                        <div className="pt-2">
                          <div className="flex gap-1 flex-wrap">
                            {tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
                  <Button variant="ghost">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Tagging Rules</CardTitle>
              <CardDescription>
                Configure automatic tag application based on conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {[
                  {
                    name: 'Critical Asset Detection',
                    condition: 'When asset criticality = Critical',
                    action: 'Apply tag: critical-infrastructure',
                    enabled: true,
                  },
                  {
                    name: 'Production Environment',
                    condition: 'When hostname contains "prod"',
                    action: 'Apply tags: production, high-priority',
                    enabled: true,
                  },
                  {
                    name: 'Compliance Scope',
                    condition: 'When asset type = Database',
                    action: 'Apply tag: pci-compliance',
                    enabled: false,
                  },
                  {
                    name: 'Customer Data Classification',
                    condition: 'When description contains "customer" OR "personal"',
                    action: 'Apply tag: customer-data',
                    enabled: true,
                  },
                ].map((rule, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Switch defaultChecked={rule.enabled} />
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.condition}
                          </p>
                          <p className="text-sm mt-1">
                            <AlertCircle className="inline h-3 w-3 mr-1" />
                            {rule.action}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merge" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Merge Tags</CardTitle>
                <CardDescription>
                  Combine duplicate or similar tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Tags</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tags to merge" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Tag</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Preview:</p>
                  <p className="text-muted-foreground">
                    245 items will be retagged
                  </p>
                </div>
                <Button className="w-full">
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Tags
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tag Cleanup</CardTitle>
                <CardDescription>
                  Remove unused or deprecated tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Unused Tags</h4>
                  {[
                    { name: 'legacy-system', usage: 0, created: '6 months ago' },
                    { name: 'test-tag', usage: 0, created: '3 months ago' },
                    { name: 'deprecated', usage: 0, created: '1 year ago' },
                  ].map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {tag.name}
                        </code>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {tag.created}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Select All
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    Delete Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}