'use client';

import { useState } from 'react';
import { useAdminAPI, adminAPI } from '@/lib/hooks/use-admin-api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Send,
  X,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Undo,
} from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: number;
  invoiceNumber: string;
  organizationId: number;
  organizationName: string;
  subscriptionId: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  currency: string;
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  voidedAt: string | null;
  lineItems: any[];
  stripeInvoiceId: string;
  stripePdfUrl: string;
  metadata: any;
}

interface InvoicesData {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalRevenue: number;
    pendingAmount: number;
    overdueCount: number;
    averageInvoiceValue: number;
  };
}

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [resendEmail, setResendEmail] = useState('');

  // Fetch invoices data
  const { data, isLoading, mutate, error } = useAdminAPI<InvoicesData>(
    `/api/system-admin/billing/invoices?page=${page}&status=${statusFilter}&search=${searchQuery}`
  );

  const handleVoidInvoice = async (invoiceId: number) => {
    try {
      await adminAPI(`/api/system-admin/billing/invoices/${invoiceId}/void`, {
        method: 'POST',
        body: { reason: voidReason },
        successMessage: 'Invoice voided successfully',
      });
      setShowVoidDialog(false);
      setVoidReason('');
      mutate();
    } catch (error) {
      console.error('Error voiding invoice:', error);
    }
  };

  const handleResendInvoice = async (invoiceId: number) => {
    try {
      await adminAPI(`/api/system-admin/billing/invoices/${invoiceId}/resend`, {
        method: 'POST',
        body: { email: resendEmail },
        successMessage: 'Invoice sent successfully',
      });
      setShowResendDialog(false);
      setResendEmail('');
    } catch (error) {
      console.error('Error resending invoice:', error);
    }
  };

  const handleRefundInvoice = async (invoiceId: number, amount?: number) => {
    try {
      await adminAPI(`/api/system-admin/billing/invoices/${invoiceId}/refund`, {
        method: 'POST',
        body: { amount },
        successMessage: amount ? 'Partial refund processed' : 'Invoice refunded successfully',
      });
      mutate();
    } catch (error) {
      console.error('Error refunding invoice:', error);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (invoice.stripePdfUrl) {
      window.open(invoice.stripePdfUrl, '_blank');
    } else {
      // Generate PDF from our system
      try {
        const response = await adminAPI(`/api/system-admin/billing/invoices/${invoice.id}/download`, {
          method: 'GET',
        });
        // Handle PDF download
      } catch (error) {
        console.error('Error downloading invoice:', error);
      }
    }
  };

  const formatCurrency = (amount: string | number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      succeeded: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', icon: Undo },
      partially_refunded: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (error) {
    const status = (error as any)?.status;
    const isAuthError = status === 401 || status === 403;

    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isAuthError ? 'Authentication Required' : 'Error Loading Invoices'}
          </h2>
          <p className="text-gray-600 max-w-md">
            {isAuthError
              ? 'You need to be logged in as a system administrator to view this page. Please login with admin@admin.com / admin123'
              : 'There was an error loading the invoice data. Please try refreshing the page.'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAuthError ? (
            <Button onClick={() => window.location.href = '/sign-in'}>
              Go to Login
            </Button>
          ) : (
            <Button onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Handle empty data
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load invoice data. Please refresh the page.</p>
          <Button onClick={() => mutate()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all organization invoices
          </p>
        </div>
        <Button
          onClick={() => mutate()}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats.pendingAmount || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {data?.stats.overdueCount || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Invoice</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data?.stats.averageInvoiceValue || 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice number, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="succeeded">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            {data?.pagination.total || 0} total invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.organizationName}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.issuedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate && (
                      <span className={isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600 font-semibold' : ''}>
                        {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowResendDialog(true);
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowVoidDialog(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {invoice.status === 'succeeded' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRefundInvoice(invoice.id)}
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && !showVoidDialog && !showResendDialog && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Invoice #{selectedInvoice.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Organization</Label>
                  <p className="font-medium">{selectedInvoice.organizationName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <Label>Issued Date</Label>
                  <p>{format(new Date(selectedInvoice.issuedAt), 'PPP')}</p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p>{selectedInvoice.dueDate && format(new Date(selectedInvoice.dueDate), 'PPP')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>Line Items</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.amount, selectedInvoice.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                </div>
                {parseFloat(selectedInvoice.tax) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedInvoice.tax, selectedInvoice.currency)}</span>
                  </div>
                )}
                {parseFloat(selectedInvoice.discount) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedInvoice.discount, selectedInvoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total, selectedInvoice.currency)}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedInvoice.status === 'pending' && (
                  <Button onClick={() => setShowResendDialog(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Invoice
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Void Invoice Dialog */}
      {showVoidDialog && selectedInvoice && (
        <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to void invoice #{selectedInvoice.invoiceNumber}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="void-reason">Reason for voiding</Label>
                <Input
                  id="void-reason"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter reason..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowVoidDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVoidInvoice(selectedInvoice.id)}
                  disabled={!voidReason}
                >
                  Void Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Resend Invoice Dialog */}
      {showResendDialog && selectedInvoice && (
        <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resend Invoice</DialogTitle>
              <DialogDescription>
                Send invoice #{selectedInvoice.invoiceNumber} to an email address
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="resend-email">Email Address</Label>
                <Input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter email address..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowResendDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleResendInvoice(selectedInvoice.id)}
                  disabled={!resendEmail}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}