'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, differenceInDays, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Shield,
  Plus,
  ChevronLeft,
  Calendar as CalendarIcon,
  FileText,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Upload,
  Download,
  User,
  Building
} from 'lucide-react';

interface InsurancePolicy {
  id: number;
  provider: string;
  policyNumber: string;
  coverageType: string;
  coverageAmount: string;
  deductible: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  claimsContact: string;
  claimsPhone: string;
  claimsEmail: string;
  policyDocument?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InsurancePoliciesPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    coverageType: '',
    coverageAmount: '',
    deductible: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    startDate: new Date(),
    endDate: addMonths(new Date(), 12),
    claimsContact: '',
    claimsPhone: '',
    claimsEmail: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/organization/insurance');
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load insurance policies',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingPolicy
        ? `/api/organization/insurance/${editingPolicy.id}`
        : '/api/organization/insurance';
      const method = editingPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Policy ${editingPolicy ? 'updated' : 'created'} successfully`
        });
        setModalOpen(false);
        resetForm();
        fetchPolicies();
      } else {
        throw new Error('Failed to save policy');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save insurance policy',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (policyId: number) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const response = await fetch(`/api/organization/insurance/${policyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Policy deleted successfully'
        });
        fetchPolicies();
      } else {
        throw new Error('Failed to delete policy');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete policy',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      provider: '',
      policyNumber: '',
      coverageType: '',
      coverageAmount: '',
      deductible: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      startDate: new Date(),
      endDate: addMonths(new Date(), 12),
      claimsContact: '',
      claimsPhone: '',
      claimsEmail: '',
      additionalNotes: ''
    });
    setEditingPolicy(null);
  };

  const openEditModal = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      provider: policy.provider,
      policyNumber: policy.policyNumber,
      coverageType: policy.coverageType,
      coverageAmount: policy.coverageAmount || '',
      deductible: policy.deductible || '',
      contactName: policy.contactName || '',
      contactEmail: policy.contactEmail || '',
      contactPhone: policy.contactPhone || '',
      startDate: new Date(policy.startDate),
      endDate: new Date(policy.endDate),
      claimsContact: policy.claimsContact || '',
      claimsPhone: policy.claimsPhone || '',
      claimsEmail: policy.claimsEmail || '',
      additionalNotes: policy.additionalNotes || ''
    });
    setModalOpen(true);
  };

  const getStatusBadge = (endDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(endDate), new Date());

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge variant="outline">Renewal Due</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const coverageTypes = [
    'General Liability',
    'Cyber Liability',
    'Professional Liability',
    'Property Insurance',
    'Workers Compensation',
    'Directors & Officers',
    'Business Interruption',
    'Errors & Omissions',
    'Data Breach',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/organization">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insurance Policies</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization&apos;s insurance coverage
            </p>
          </div>
        </div>
        <Dialog open={modalOpen} onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
              </DialogTitle>
              <DialogDescription>
                Enter the details of your insurance policy
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Policy Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Policy Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Insurance Provider</Label>
                    <Input
                      id="provider"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="Acme Insurance Co."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                      placeholder="POL-123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverageType">Coverage Type</Label>
                    <select
                      id="coverageType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.coverageType}
                      onChange={(e) => setFormData({ ...formData, coverageType: e.target.value })}
                    >
                      <option value="">Select coverage type</option>
                      {coverageTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Coverage Amount</Label>
                    <Input
                      id="coverageAmount"
                      value={formData.coverageAmount}
                      onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                      placeholder="$1,000,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductible">Deductible</Label>
                    <Input
                      id="deductible"
                      value={formData.deductible}
                      onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                      placeholder="$10,000"
                    />
                  </div>
                </div>
              </div>

              {/* Policy Period */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Policy Period</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Contact Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="john@insurance.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Claims Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Claims Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="claimsContact">Claims Contact</Label>
                    <Input
                      id="claimsContact"
                      value={formData.claimsContact}
                      onChange={(e) => setFormData({ ...formData, claimsContact: e.target.value })}
                      placeholder="Claims Department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimsPhone">Claims Phone</Label>
                    <Input
                      id="claimsPhone"
                      value={formData.claimsPhone}
                      onChange={(e) => setFormData({ ...formData, claimsPhone: e.target.value })}
                      placeholder="1-800-CLAIMS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimsEmail">Claims Email</Label>
                    <Input
                      id="claimsEmail"
                      type="email"
                      value={formData.claimsEmail}
                      onChange={(e) => setFormData({ ...formData, claimsEmail: e.target.value })}
                      placeholder="claims@insurance.com"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional information about this policy..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPolicy ? 'Update Policy' : 'Add Policy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{policies.length}</p>
                <p className="text-sm text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {policies.filter(p => differenceInDays(new Date(p.endDate), new Date()) > 0 && differenceInDays(new Date(p.endDate), new Date()) <= 90).length}
                </p>
                <p className="text-sm text-muted-foreground">Renewal Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {policies.filter(p => differenceInDays(new Date(p.endDate), new Date()) <= 30).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {policies.filter(p => p.coverageType === 'Cyber Liability').length}
                </p>
                <p className="text-sm text-muted-foreground">Cyber Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Insurance Policies</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your organization&apos;s insurance policies
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{policy.provider}</h3>
                          {getStatusBadge(policy.endDate)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Policy #{policy.policyNumber} • {policy.coverageType}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(policy.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Coverage Amount</p>
                        <p className="font-medium">{policy.coverageAmount || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Deductible</p>
                        <p className="font-medium">{policy.deductible || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Policy Period</p>
                        <p className="font-medium">
                          {format(new Date(policy.startDate), 'MMM d, yyyy')} - {format(new Date(policy.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Days Until Renewal</p>
                        <p className="font-medium">
                          {Math.max(0, differenceInDays(new Date(policy.endDate), new Date()))} days
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {policy.contactName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Contact</p>
                            <p className="text-sm text-muted-foreground">{policy.contactName}</p>
                            {policy.contactEmail && (
                              <p className="text-sm text-muted-foreground">{policy.contactEmail}</p>
                            )}
                            {policy.contactPhone && (
                              <p className="text-sm text-muted-foreground">{policy.contactPhone}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {policy.claimsContact && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Claims</p>
                            <p className="text-sm text-muted-foreground">{policy.claimsContact}</p>
                            {policy.claimsPhone && (
                              <p className="text-sm text-muted-foreground">{policy.claimsPhone}</p>
                            )}
                            {policy.claimsEmail && (
                              <p className="text-sm text-muted-foreground">{policy.claimsEmail}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {policy.additionalNotes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{policy.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}