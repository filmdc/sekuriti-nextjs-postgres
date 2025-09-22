'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';

interface APIKey {
  id: number;
  name: string;
  key: string;
  type: 'public' | 'secret';
  permissions: string[];
  lastUsed: string;
  created: string;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

export default function APIKeysPage() {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'public' | 'secret'>('secret');

  const [apiKeys] = useState<APIKey[]>([
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_live_4242424242424242',
      type: 'secret',
      permissions: ['read', 'write', 'delete'],
      lastUsed: '2025-01-20T10:30:00',
      created: '2024-12-01T08:00:00',
      status: 'active',
      usageCount: 15234,
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_test_9876543210987654',
      type: 'secret',
      permissions: ['read', 'write'],
      lastUsed: '2025-01-22T14:45:00',
      created: '2024-11-15T12:00:00',
      status: 'active',
      usageCount: 8921,
    },
    {
      id: 3,
      name: 'Public Key',
      key: 'pk_live_1234567890123456',
      type: 'public',
      permissions: ['read'],
      lastUsed: 'Never',
      created: '2024-10-01T09:00:00',
      status: 'expired',
      usageCount: 0,
    },
  ]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the API key',
        variant: 'destructive',
      });
      return;
    }

    const newKey = newKeyType === 'secret'
      ? `sk_live_${Math.random().toString(36).substring(2, 18)}`
      : `pk_live_${Math.random().toString(36).substring(2, 18)}`;

    toast({
      title: 'API Key Created',
      description: (
        <div className="space-y-2">
          <p>Your new API key has been created.</p>
          <p className="font-mono text-sm bg-muted p-2 rounded">{newKey}</p>
          <p className="text-xs text-muted-foreground">
            Make sure to copy it now. You won't be able to see it again!
          </p>
        </div>
      ),
    });

    setCreateOpen(false);
    setNewKeyName('');
    setNewKeyType('secret');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage platform API keys and access tokens
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for platform access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Key Type</Label>
                <Select value={newKeyType} onValueChange={(v: 'public' | 'secret') => setNewKeyType(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="secret">Secret Key</SelectItem>
                    <SelectItem value="public">Public Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Read</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Write</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Delete</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey}>
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Warning */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            API keys provide programmatic access to the platform. Keep them secure and never expose secret keys in client-side code.
            Rotate keys regularly and revoke unused keys immediately.
          </p>
        </CardContent>
      </Card>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Active and inactive API keys for platform access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apiKey.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(apiKey.created).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">
                        {showKeys[apiKey.id]
                          ? apiKey.key
                          : `${apiKey.key.substring(0, 10)}...`}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowKeys(prev => ({
                          ...prev,
                          [apiKey.id]: !prev[apiKey.id]
                        }))}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.type === 'secret' ? 'destructive' : 'default'}>
                      {apiKey.type === 'secret' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Secret
                        </>
                      ) : (
                        <>
                          <Key className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
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
                  <TableCell>
                    {apiKey.lastUsed === 'Never' ? (
                      <span className="text-sm text-muted-foreground">Never</span>
                    ) : (
                      <div className="text-sm">
                        {new Date(apiKey.lastUsed).toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {apiKey.usageCount.toLocaleString()} calls
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.status === 'active' ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : apiKey.status === 'expired' ? (
                      <Badge variant="outline" className="text-yellow-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600">
                        <XCircle className="h-3 w-3 mr-1" />
                        Revoked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      disabled={apiKey.status !== 'active'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>API Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground">
              Include your API key in the Authorization header: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Rate Limits</h4>
            <p className="text-sm text-muted-foreground">
              Default rate limit: 1000 requests per hour per key. Enterprise plans have higher limits.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Best Practices</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Never expose secret keys in client-side code</li>
              <li>• Use environment variables to store keys</li>
              <li>• Rotate keys regularly (every 90 days recommended)</li>
              <li>• Use separate keys for development and production</li>
              <li>• Implement proper error handling for API responses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}