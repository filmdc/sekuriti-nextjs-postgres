'use client';

import { useState, useEffect } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Key,
  Plus,
  Minus,
  Users,
  Building,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface LicenseAllocation {
  id: number;
  organizationId: number;
  organizationName: string;
  licenseType: string;
  totalLicenses: number;
  usedLicenses: number;
  status: string;
  planName?: string;
  billingCycle?: string;
  createdAt?: string;
  stripeStatus?: string;
}

interface LicenseStats {
  totalOrganizations: number;
  totalLicenses: number;
  usedLicenses: number;
  overAllocated: number;
}

export default function LicenseManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<LicenseAllocation[]>([]);
  const [stats, setStats] = useState<LicenseStats>({
    totalOrganizations: 0,
    totalLicenses: 0,
    usedLicenses: 0,
    overAllocated: 0,
  });

  useEffect(() => {
    fetchLicenseData();
  }, []);

  const fetchLicenseData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system-admin/licenses');
      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations || []);
        setStats(data.stats || {
          totalOrganizations: 0,
          totalLicenses: 0,
          usedLicenses: 0,
          overAllocated: 0,
        });
      } else {
        throw new Error('Failed to fetch license data');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<LicenseAllocation | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // No need to calculate stats here as we get them from the API

  const handleAdjustLicenses = async () => {
    if (!selectedAllocation || adjustmentAmount === 0) return;

    const newTotal = selectedAllocation.totalLicenses + adjustmentAmount;

    if (newTotal < 0) {
      toast({
        title: 'Error',
        description: 'Cannot reduce licenses below 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/system-admin/licenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedAllocation.organizationId,
          licenseCount: newTotal,
          licenseType: selectedAllocation.licenseType,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Adjusted licenses for ${selectedAllocation.organizationName}`,
        });
        fetchLicenseData(); // Refresh the data
      } else {
        throw new Error('Failed to update licenses');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }

    setAdjustOpen(false);
    setSelectedAllocation(null);
    setAdjustmentAmount(0);
    setAdjustmentReason('');
  };

  const exportLicenseReport = () => {
    const csv = [
      ['Organization', 'License Type', 'Total', 'Used', 'Available', 'Usage %', 'Status', 'Expiry', 'Cost'],
      ...allocations.map(a => [
        a.organizationName,
        a.licenseType,
        a.totalLicenses,
        a.usedLicenses,
        a.totalLicenses - a.usedLicenses,
        `${Math.round((a.usedLicenses / a.totalLicenses) * 100)}%`,
        a.status,
        a.expiryDate,
        `$${a.cost}`,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">License Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage organization license allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportLicenseReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Allocate Licenses
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Licenses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usedLicenses}</div>
            <Progress value={stats.totalLicenses > 0 ? (stats.usedLicenses / stats.totalLicenses) * 100 : 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalLicenses > 0 ? Math.round((stats.usedLicenses / stats.totalLicenses) * 100) : 0}% utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over-Allocated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overAllocated}</div>
            <p className="text-xs text-muted-foreground">
              Organizations exceeding limit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              Total organizations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search organizations..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Billing Cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* License Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle>License Allocations</CardTitle>
          <CardDescription>
            Current license distribution across organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((allocation) => {
                  const usagePercent = allocation.totalLicenses > 0
                    ? (allocation.usedLicenses / allocation.totalLicenses) * 100
                    : 0;
                  const isOverAllocated = allocation.usedLicenses > allocation.totalLicenses;

                  return (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{allocation.organizationName}</p>
                            <p className="text-xs text-muted-foreground">ID: {allocation.organizationId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{allocation.licenseType || 'Standard'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isOverAllocated ? 'text-red-600' : ''}`}>
                              {allocation.usedLicenses} / {allocation.totalLicenses}
                            </span>
                            {isOverAllocated && (
                              <Badge variant="destructive" className="text-xs">
                                Over limit
                              </Badge>
                            )}
                          </div>
                          <Progress
                            value={Math.min(usagePercent, 100)}
                            className={`h-2 ${isOverAllocated ? '[&>div]:bg-red-600' : ''}`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {Math.round(usagePercent)}% utilized
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {allocation.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{allocation.planName || 'Free'}</p>
                          <p className="text-xs text-muted-foreground">
                            {allocation.billingCycle || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.createdAt && (
                          <p className="text-sm">
                            {new Date(allocation.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAllocation(allocation);
                            setAdjustOpen(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjust Licenses Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust License Allocation</DialogTitle>
            <DialogDescription>
              Modify the license count for {selectedAllocation?.organizationName}
            </DialogDescription>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-4">
              <div>
                <Label>Current Allocation</Label>
                <p className="text-2xl font-bold">{selectedAllocation.totalLicenses} licenses</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAllocation.usedLicenses} currently in use
                </p>
              </div>
              <div>
                <Label>Adjustment</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustmentAmount(adjustmentAmount - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                    className="w-24 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAdjustmentAmount(adjustmentAmount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  New total: {selectedAllocation.totalLicenses + adjustmentAmount} licenses
                </p>
              </div>
              <div>
                <Label>Reason for Adjustment</Label>
                <Input
                  placeholder="e.g., Organization growth, downsizing, etc."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustLicenses}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}