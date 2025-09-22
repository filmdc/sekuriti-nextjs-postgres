'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Copy, 
  FileText, 
  Mail, 
  MessageSquare,
  AlertCircle,
  Shield,
  Users,
  Eye
} from 'lucide-react'

const mockTemplates = [
  {
    id: 1,
    name: 'Initial Incident Alert',
    category: 'incident',
    type: 'email',
    variables: ['incident_type', 'severity', 'affected_systems'],
    usageCount: 245,
    lastModified: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Stakeholder Update',
    category: 'communication',
    type: 'email',
    variables: ['status', 'eta', 'impact'],
    usageCount: 189,
    lastModified: '2024-01-14',
    status: 'active',
  },
  {
    id: 3,
    name: 'Post-Incident Report',
    category: 'report',
    type: 'document',
    variables: ['root_cause', 'timeline', 'lessons_learned'],
    usageCount: 67,
    lastModified: '2024-01-12',
    status: 'active',
  },
  {
    id: 4,
    name: 'Security Advisory',
    category: 'security',
    type: 'announcement',
    variables: ['threat_level', 'mitigation_steps'],
    usageCount: 134,
    lastModified: '2024-01-10',
    status: 'active',
  },
]

const templateCategories = [
  { value: 'incident', label: 'Incident Response', icon: AlertCircle },
  { value: 'communication', label: 'Communications', icon: MessageSquare },
  { value: 'report', label: 'Reports', icon: FileText },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'training', label: 'Training', icon: Users },
]

export default function ContentTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage system-wide templates for incidents, communications, and reports
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {templateCategories.slice(0, 4).map((cat) => {
          const Icon = cat.icon
          const count = mockTemplates.filter(t => t.category === cat.value).length
          return (
            <Card key={cat.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">Active templates</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">All Templates</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="editor">Template Editor</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Library</CardTitle>
              <CardDescription>
                System-wide templates available to all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Search templates..." className="max-w-sm" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {templateCategories.map((cat) => (
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
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map((template) => {
                    const category = templateCategories.find(c => c.value === template.category)
                    const Icon = category?.icon || FileText
                    return (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {template.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{category?.label}</Badge>
                        </TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {template.variables.slice(0, 2).map((v) => (
                              <Badge key={v} variant="secondary" className="text-xs">
                                {{{v}}}
                              </Badge>
                            ))}
                            {template.variables.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.variables.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{template.usageCount}</TableCell>
                        <TableCell>{template.lastModified}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            {template.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
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

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Define reusable variables for templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'incident_type', description: 'Type of security incident', example: 'Data Breach' },
                    { name: 'severity', description: 'Incident severity level', example: 'Critical' },
                    { name: 'affected_systems', description: 'List of affected systems', example: 'Database, API' },
                    { name: 'eta', description: 'Estimated time to resolution', example: '2 hours' },
                    { name: 'status', description: 'Current incident status', example: 'Investigating' },
                    { name: 'root_cause', description: 'Root cause analysis', example: 'Misconfigured firewall' },
                  ].map((variable) => (
                    <div key={variable.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{{{variable.name}}}</Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {variable.description}
                      </p>
                      <p className="text-xs font-mono bg-muted p-1 rounded">
                        Example: {variable.example}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Editor</CardTitle>
              <CardDescription>
                Create or edit email and document templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input placeholder="e.g., Initial Incident Alert" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject Line (for emails)</Label>
                <Input placeholder="[{{severity}}] Security Incident: {{incident_type}}" />
              </div>
              <div className="space-y-2">
                <Label>Template Content</Label>
                <Textarea 
                  placeholder="Dear {{recipient_name}},

We are writing to inform you of a {{severity}} security incident..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline">Insert Variable</Button>
                  <Button variant="outline">Preview</Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Publish Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Usage Analytics</CardTitle>
              <CardDescription>
                Track template usage across organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Most Used Templates</h4>
                    {[
                      { name: 'Initial Incident Alert', usage: 245, trend: '+12%' },
                      { name: 'Stakeholder Update', usage: 189, trend: '+8%' },
                      { name: 'Security Advisory', usage: 134, trend: '+15%' },
                      { name: 'Post-Incident Report', usage: 67, trend: '-3%' },
                    ].map((template) => (
                      <div key={template.name} className="flex items-center justify-between">
                        <span className="text-sm">{template.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{template.usage}</span>
                          <Badge 
                            variant="outline" 
                            className={template.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}
                          >
                            {template.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Usage by Category</h4>
                    {templateCategories.map((cat) => {
                      const usage = Math.floor(Math.random() * 100)
                      return (
                        <div key={cat.value} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{cat.label}</span>
                            <span className="font-medium">{usage}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2" 
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}