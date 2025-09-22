import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, ChevronDown, List, AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DropdownsPage() {
  // Placeholder dropdown data
  const dropdowns = {
    incident: [
      {
        id: 1,
        field: 'Severity',
        values: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
        type: 'ordered',
        usage: 'All incident forms',
        itemCount: 5,
        lastUpdated: '2024-10-10',
      },
      {
        id: 2,
        field: 'Attack Vector',
        values: ['Email', 'Web', 'Network', 'Physical', 'Social Engineering', 'Supply Chain'],
        type: 'unordered',
        usage: 'Incident classification',
        itemCount: 6,
        lastUpdated: '2024-10-08',
      },
      {
        id: 3,
        field: 'Impact Type',
        values: ['Data Breach', 'Service Disruption', 'Financial Loss', 'Reputation', 'Compliance'],
        type: 'multi-select',
        usage: 'Impact assessment',
        itemCount: 5,
        lastUpdated: '2024-10-12',
      },
    ],
    asset: [
      {
        id: 1,
        field: 'Asset Type',
        values: ['Hardware', 'Software', 'Service', 'People', 'Data', 'Network'],
        type: 'unordered',
        usage: 'Asset categorization',
        itemCount: 6,
        lastUpdated: '2024-10-05',
      },
      {
        id: 2,
        field: 'Criticality',
        values: ['Critical', 'High', 'Medium', 'Low'],
        type: 'ordered',
        usage: 'Asset importance',
        itemCount: 4,
        lastUpdated: '2024-10-03',
      },
      {
        id: 3,
        field: 'Location',
        values: ['On-Premise', 'Cloud - AWS', 'Cloud - Azure', 'Cloud - GCP', 'Hybrid', 'Edge'],
        type: 'unordered',
        usage: 'Asset location',
        itemCount: 6,
        lastUpdated: '2024-10-11',
      },
    ],
    compliance: [
      {
        id: 1,
        field: 'Framework',
        values: ['SOC 2', 'ISO 27001', 'NIST', 'PCI DSS', 'HIPAA', 'GDPR'],
        type: 'multi-select',
        usage: 'Compliance tracking',
        itemCount: 6,
        lastUpdated: '2024-10-07',
      },
      {
        id: 2,
        field: 'Control Status',
        values: ['Implemented', 'In Progress', 'Planned', 'Not Applicable', 'Failed'],
        type: 'ordered',
        usage: 'Control assessment',
        itemCount: 5,
        lastUpdated: '2024-10-09',
      },
    ],
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dropdown Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide dropdown options and values
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          This page is under development. Dropdown management functionality will be available soon.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Dropdowns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Configured fields</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186</div>
            <p className="text-xs text-muted-foreground">Across all dropdowns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Field categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2d ago</div>
            <p className="text-xs text-muted-foreground">Most recent change</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dropdown Fields</CardTitle>
              <CardDescription>Manage dropdown options for forms and fields across the system</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Dropdown
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search dropdowns
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search dropdown fields..."
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
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="incident" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="incident">Incident Management</TabsTrigger>
              <TabsTrigger value="asset">Asset Management</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="incident">
              <div className="space-y-4">
                {dropdowns.incident.map((dropdown) => (
                  <div key={dropdown.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{dropdown.field}</h3>
                          <Badge variant="outline">
                            {dropdown.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{dropdown.usage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dropdown.values.map((value, index) => (
                        <Badge key={index} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <List className="h-3 w-3" />
                        {dropdown.itemCount} items
                      </span>
                      <span>Last updated: {dropdown.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="asset">
              <div className="space-y-4">
                {dropdowns.asset.map((dropdown) => (
                  <div key={dropdown.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{dropdown.field}</h3>
                          <Badge variant="outline">
                            {dropdown.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{dropdown.usage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dropdown.values.map((value, index) => (
                        <Badge key={index} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <List className="h-3 w-3" />
                        {dropdown.itemCount} items
                      </span>
                      <span>Last updated: {dropdown.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compliance">
              <div className="space-y-4">
                {dropdowns.compliance.map((dropdown) => (
                  <div key={dropdown.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{dropdown.field}</h3>
                          <Badge variant="outline">
                            {dropdown.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{dropdown.usage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dropdown.values.map((value, index) => (
                        <Badge key={index} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <List className="h-3 w-3" />
                        {dropdown.itemCount} items
                      </span>
                      <span>Last updated: {dropdown.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Import/Export</CardTitle>
          <CardDescription>Manage dropdown configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">
              Import Configuration
            </Button>
            <Button variant="outline">
              Export Configuration
            </Button>
            <Button variant="outline">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}