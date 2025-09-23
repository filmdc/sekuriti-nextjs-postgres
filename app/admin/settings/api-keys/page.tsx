import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
  Shield,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default async function APIKeysPage() {
  // Mock data - in production, fetch from database
  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_prod_...abc123',
      created: '2024-01-15',
      lastUsed: '2024-12-20',
      status: 'active',
      permissions: ['read', 'write'],
      usage: 15234,
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_dev_...xyz789',
      created: '2024-02-20',
      lastUsed: '2024-12-19',
      status: 'active',
      permissions: ['read'],
      usage: 8432,
    },
    {
      id: 3,
      name: 'Legacy Integration',
      key: 'sk_legacy_...def456',
      created: '2023-11-10',
      lastUsed: '2024-11-30',
      status: 'inactive',
      permissions: ['read', 'write'],
      usage: 98234,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Key className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
        </div>
        <p className="text-gray-600">
          Manage API keys for system integrations and third-party access
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Keys</p>
              <p className="text-2xl font-bold mt-1">3</p>
            </div>
            <Key className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Keys</p>
              <p className="text-2xl font-bold mt-1">2</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Calls (24h)</p>
              <p className="text-2xl font-bold mt-1">23.6K</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rate Limit</p>
              <p className="text-2xl font-bold mt-1">1000/hr</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">API Keys</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for system integrations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key-description">Description</Label>
                    <textarea
                      id="key-description"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Optional description for this key"
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Read</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Write</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">Delete</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expiration">Expiration (optional)</Label>
                    <Input
                      id="expiration"
                      type="date"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Key</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {apiKey.key}
                    </code>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                  >
                    {apiKey.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {apiKey.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{apiKey.lastUsed}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {apiKey.usage.toLocaleString()} calls
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Rate Limiting Settings */}
      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rate Limiting Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="global-rate">Global Rate Limit (per hour)</Label>
            <Input
              id="global-rate"
              type="number"
              defaultValue="1000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="burst-limit">Burst Limit</Label>
            <Input
              id="burst-limit"
              type="number"
              defaultValue="100"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="per-key-limit">Per-Key Limit (per hour)</Label>
            <Input
              id="per-key-limit"
              type="number"
              defaultValue="500"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cooldown">Cooldown Period (minutes)</Label>
            <Input
              id="cooldown"
              type="number"
              defaultValue="15"
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Rate Limit Notice</p>
              <p className="text-sm text-yellow-700 mt-1">
                Changes to rate limits will apply to all new API requests immediately.
                Existing connections will not be affected.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save Rate Limits</Button>
        </div>
      </Card>

      {/* Recent API Activity */}
      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent API Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Production API Key</p>
              <p className="text-sm text-gray-600">POST /api/incidents - 200 OK</p>
            </div>
            <p className="text-sm text-gray-500">2 minutes ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Development API Key</p>
              <p className="text-sm text-gray-600">GET /api/assets - 200 OK</p>
            </div>
            <p className="text-sm text-gray-500">15 minutes ago</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Production API Key</p>
              <p className="text-sm text-gray-600">PUT /api/runbooks/123 - 200 OK</p>
            </div>
            <p className="text-sm text-gray-500">1 hour ago</p>
          </div>
        </div>
      </Card>
    </div>
  );
}