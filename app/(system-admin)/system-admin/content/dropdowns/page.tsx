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
  ChevronDown,
  List,
  Hash,
  Calendar,
  User,
  Shield,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react'

const mockDropdowns = [
  {
    id: 1,
    name: 'Incident Severity',
    key: 'incident_severity',
    type: 'single',
    values: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
    usage: 156,
    required: true,
    system: true,
  },
  {
    id: 2,
    name: 'Asset Type',
    key: 'asset_type',
    type: 'single',
    values: ['Server', 'Workstation', 'Network Device', 'Application', 'Database', 'Cloud Service'],
    usage: 423,
    required: false,
    system: true,
  },
  {
    id: 3,
    name: 'Incident Status',
    key: 'incident_status',
    type: 'single',
    values: ['Open', 'Investigating', 'Contained', 'Eradicating', 'Recovering', 'Closed'],
    usage: 289,
    required: true,
    system: true,
  },
  {
    id: 4,
    name: 'Compliance Framework',
    key: 'compliance_framework',
    type: 'multi',
    values: ['SOC2', 'ISO27001', 'HIPAA', 'GDPR', 'PCI-DSS', 'NIST'],
    usage: 67,
    required: false,
    system: false,
  },
  {
    id: 5,
    name: 'Department',
    key: 'department',
    type: 'single',
    values: ['Engineering', 'Security', 'IT', 'HR', 'Finance', 'Legal', 'Operations'],
    usage: 234,
    required: false,
    system: false,
  },
]

const dropdownTypes = [
  { value: 'single', label: 'Single Select', icon: List },
  { value: 'multi', label: 'Multi Select', icon: Hash },
  { value: 'date', label: 'Date Picker', icon: Calendar },
  { value: 'user', label: 'User Selector', icon: User },
]

export default function ContentDropdownsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Dropdowns</h1>
          <p className="text-muted-foreground mt-2">
            Manage dropdown options and select lists across the platform
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Dropdown
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dropdowns</CardTitle>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDropdowns.length}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Dropdowns</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDropdowns.filter(d => d.system).length}
            </div>
            <p className="text-xs text-muted-foreground">Protected from deletion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Fields</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDropdowns.filter(d => d.required).length}
            </div>
            <p className="text-xs text-muted-foreground">Must be filled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockDropdowns.reduce((acc, d) => acc + d.usage, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Times used this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dropdowns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dropdowns">All Dropdowns</TabsTrigger>
          <TabsTrigger value="editor">Dropdown Editor</TabsTrigger>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="dropdowns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown Definitions</CardTitle>
              <CardDescription>
                System-wide dropdown menus and select lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Search dropdowns..." className="max-w-sm" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {dropdownTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dropdown Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Values</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDropdowns.map((dropdown) => {
                    const type = dropdownTypes.find(t => t.value === dropdown.type)
                    const Icon = type?.icon || List
                    return (
                      <TableRow key={dropdown.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {dropdown.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {dropdown.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{type?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {dropdown.values.slice(0, 3).map((value) => (
                              <Badge key={value} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                            {dropdown.values.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{dropdown.values.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{dropdown.usage}</TableCell>
                        <TableCell>
                          {dropdown.required ? (
                            <Badge variant="outline" className="text-orange-600">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {dropdown.system ? (
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
                              disabled={dropdown.system}
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

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown Editor</CardTitle>
              <CardDescription>
                Create or modify dropdown lists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input placeholder="e.g., Incident Severity" />
                </div>
                <div className="space-y-2">
                  <Label>System Key</Label>
                  <Input placeholder="e.g., incident_severity" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dropdownTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <Input placeholder="e.g., Medium" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dropdown Values</Label>
                <div className="space-y-2">
                  {['Critical', 'High', 'Medium', 'Low', 'Informational'].map((value, i) => (
                    <div key={i} className="flex gap-2">
                      <Input defaultValue={value} />
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="required" />
                  <Label htmlFor="required">Required field</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sortable" defaultChecked />
                  <Label htmlFor="sortable">Allow sorting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="searchable" defaultChecked />
                  <Label htmlFor="searchable">Searchable</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Dropdown</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>
                Map dropdowns to forms and entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { entity: 'Incidents', fields: ['severity', 'status', 'type', 'category'] },
                  { entity: 'Assets', fields: ['type', 'criticality', 'department', 'location'] },
                  { entity: 'Users', fields: ['role', 'department', 'team', 'status'] },
                  { entity: 'Runbooks', fields: ['category', 'phase', 'priority'] },
                  { entity: 'Communications', fields: ['type', 'audience', 'channel'] },
                ].map((mapping) => (
                  <div key={mapping.entity} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{mapping.entity}</h4>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {mapping.fields.map((field) => (
                        <div key={field} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{field}:</span>
                          <Select defaultValue="default">
                            <SelectTrigger className="h-7 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              {mockDropdowns.map((dd) => (
                                <SelectItem key={dd.id} value={dd.key}>
                                  {dd.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Import Dropdowns</CardTitle>
                <CardDescription>
                  Import dropdown definitions from CSV or JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input type="file" className="hidden" id="import-file" />
                  <Label htmlFor="import-file" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-muted-foreground">
                        Drop files here or click to browse
                      </div>
                      <Button variant="outline" type="button">
                        Select File
                      </Button>
                    </div>
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  Supported formats: CSV, JSON
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Dropdowns</CardTitle>
                <CardDescription>
                  Export dropdown definitions for backup or migration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Include</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="system-dropdowns" defaultChecked />
                      <Label htmlFor="system-dropdowns" className="text-sm font-normal">
                        System dropdowns
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="custom-dropdowns" defaultChecked />
                      <Label htmlFor="custom-dropdowns" className="text-sm font-normal">
                        Custom dropdowns
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="mappings" />
                      <Label htmlFor="mappings" className="text-sm font-normal">
                        Field mappings
                      </Label>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  Export Dropdowns
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}