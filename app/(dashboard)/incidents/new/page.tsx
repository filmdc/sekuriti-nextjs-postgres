'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QuotaErrorAlert } from '@/components/quota/quota-error-alert';
import { QuotaWarningBadge } from '@/components/quota/quota-warning-badge';
import { useOrganizationLimits } from '@/lib/hooks/use-organization-limits';
import { useQuotaError } from '@/lib/hooks/use-organization-limits';
import { toast } from 'sonner';
import { DynamicSelect } from '@/components/ui/dynamic-select';

// Options are now loaded dynamically from the API

export default function NewIncidentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<any>(null);
  const { limits, isLoading: limitsLoading } = useOrganizationLimits();
  const { isQuotaError, quotaError } = useQuotaError(apiError);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classification: 'other',
    severity: 'medium',
    detectionDetails: '',
  });

  // Check if we're approaching or at quota limit
  const incidentQuotaReached = limits && limits.maxIncidents &&
    limits.currentUsers >= limits.maxIncidents;
  const incidentQuotaWarning = limits && limits.maxIncidents &&
    limits.currentUsers >= limits.maxIncidents * 0.8;

  const breadcrumbItems = [
    { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { label: 'New Incident' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for quota or feature errors
        if (data.code === 'QUOTA_EXCEEDED' || data.code === 'FEATURE_RESTRICTED') {
          setApiError(data);
          return;
        }
        throw new Error(data.message || 'Failed to create incident');
      }

      toast.success('Incident created successfully');
      router.push(`/incidents/${data.id}`);
    } catch (error) {
      console.error('Error creating incident:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create incident. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/incidents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Record New Incident</h2>
              {limits && limits.maxIncidents && (
                <QuotaWarningBadge
                  current={limits.currentUsers || 0}
                  limit={limits.maxIncidents}
                  resource="incidents"
                />
              )}
            </div>
            <p className="text-muted-foreground mt-2">
              Document a security incident for tracking and response
            </p>
          </div>
        </div>
      </div>

      {/* Quota Error Alert */}
      {quotaError && (
        <QuotaErrorAlert
          error={quotaError}
          onDismiss={() => setApiError(null)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the incident"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Detailed description of what happened"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="classification">Classification *</Label>
                  <DynamicSelect
                    dropdownKey="incident_type"
                    value={formData.classification}
                    onValueChange={(value) => setFormData({ ...formData, classification: value })}
                    placeholder="Select incident type"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="severity">Severity *</Label>
                  <DynamicSelect
                    dropdownKey="incident_severity"
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                    placeholder="Select severity level"
                    showDescription
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detection Phase</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="detectionDetails">How was this incident detected?</Label>
                <textarea
                  id="detectionDetails"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe how the incident was discovered (e.g., monitoring alert, user report, etc.)"
                  value={formData.detectionDetails}
                  onChange={(e) => setFormData({ ...formData, detectionDetails: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" asChild>
              <Link href="/incidents">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || incidentQuotaReached}
            >
              {isSubmitting ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4 animate-pulse" />
                  Creating...
                </>
              ) : incidentQuotaReached ? (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Quota Exceeded
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Create Incident
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}