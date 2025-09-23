'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Key,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

interface License {
  id: string;
  key: string;
  organization: string;
  organizationId: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  seats: number;
  usedSeats: number;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  validFrom: string;
  validUntil: string;
  lastActivity: string;
  features: string[];
}

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Mock data for demonstration
    const mockLicenses: License[] = [
      {
        id: 'lic_001',
        key: 'ENT-2024-A1B2C3D4',
        organization: 'TechCorp Solutions',
        organizationId: 'org_001',
        plan: 'Enterprise',
        seats: 100,
        usedSeats: 87,
        status: 'active',
        validFrom: '2024-01-01',
        validUntil: '2025-01-01',
        lastActivity: '2024-06-15T10:30:00Z',
        features: ['Unlimited Incidents', 'Advanced Analytics', 'API Access', 'Priority Support'],
      },
      {
        id: 'lic_002',
        key: 'PRO-2024-E5F6G7H8',
        organization: 'DataSec Industries',
        organizationId: 'org_002',
        plan: 'Professional',
        seats: 20,
        usedSeats: 15,
        status: 'active',
        validFrom: '2024-03-15',
        validUntil: '2025-03-15',
        lastActivity: '2024-06-14T14:20:00Z',
        features: ['Unlimited Incidents', 'Basic Analytics', 'API Access'],
      },
      {
        id: 'lic_003',
        key: 'STR-2024-I9J0K1L2',
        organization: 'CloudGuard Inc',
        organizationId: 'org_003',
        plan: 'Starter',
        seats: 5,
        usedSeats: 5,
        status: 'active',
        validFrom: '2024-05-01',
        validUntil: '2024-11-01',
        lastActivity: '2024-06-13T09:15:00Z',
        features: ['10 Incidents/month', 'Basic Features'],
      },
      {
        id: 'lic_004',
        key: 'PRO-2024-M3N4O5P6',
        organization: 'SecureNet Corp',
        organizationId: 'org_004',
        plan: 'Professional',
        seats: 25,
        usedSeats: 18,
        status: 'expired',
        validFrom: '2023-06-01',
        validUntil: '2024-06-01',
        lastActivity: '2024-05-31T23:59:00Z',
        features: ['Unlimited Incidents', 'Basic Analytics', 'API Access'],
      },
      {
        id: 'lic_005',
        key: 'ENT-2024-Q7R8S9T0',
        organization: 'GlobalShield Systems',
        organizationId: 'org_005',
        plan: 'Enterprise',
        seats: 200,
        usedSeats: 145,
        status: 'active',
        validFrom: '2024-02-01',
        validUntil: '2025-02-01',
        lastActivity: '2024-06-15T16:45:00Z',
        features: ['Unlimited Incidents', 'Advanced Analytics', 'API Access', 'Priority Support'],
      },
    ];

    setTimeout(() => {
      setLicenses(mockLicenses);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      expired: 'destructive',
      suspended: 'secondary',
      pending: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      Enterprise: 'bg-purple-100 text-purple-800',
      Professional: 'bg-blue-100 text-blue-800',
      Starter: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan]}`}>
        {plan}
      </span>
    );
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || license.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditLicense = (license: License) => {
    setSelectedLicense(license);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLicense = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteDialogOpen(true);
  };

  const calculateSeatUsage = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    return {
      percentage,
      color: percentage > 90 ? 'text-red-600' : percentage > 70 ? 'text-yellow-600' : 'text-green-600',
      bgColor: percentage > 90 ? 'bg-red-100' : percentage > 70 ? 'bg-yellow-100' : 'bg-green-100',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-500 mt-1">
            Manage organization licenses and seat allocations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New License
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Licenses</p>
                <p className="text-2xl font-bold">{licenses.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {licenses.filter(l => l.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Seats</p>
                <p className="text-2xl font-bold">
                  {licenses.reduce((sum, l) => sum + l.seats, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by organization or license key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-[180px]">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Licenses</CardTitle>
          <CardDescription>
            Showing {paginatedLicenses.length} of {filteredLicenses.length} licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>License Key</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLicenses.map((license) => {
                const seatUsage = calculateSeatUsage(license.usedSeats, license.seats);
                return (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{license.organization}</p>
                        <p className="text-xs text-gray-500">ID: {license.organizationId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {license.key}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(license.plan)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className={`font-medium ${seatUsage.color}`}>
                            {license.usedSeats} / {license.seats}
                          </span>
                        </div>
                        <div className="mt-1 w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${seatUsage.bgColor}`}
                            style={{ width: `${seatUsage.percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(license.status)}
                        {getStatusBadge(license.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(license.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLicense(license)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLicense(license)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit License Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit License</DialogTitle>
            <DialogDescription>
              Update license details for {selectedLicense?.organization}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seats</label>
              <Input
                type="number"
                defaultValue={selectedLicense?.seats}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedLicense?.status}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Valid Until</label>
              <Input
                type="date"
                defaultValue={selectedLicense?.validUntil}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete License Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete License</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the license for {selectedLicense?.organization}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(false)}>
              Delete License
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}