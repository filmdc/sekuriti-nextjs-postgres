'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importIncidentsAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';

interface IncidentListClientProps {
  incidents: any[];
}

export function IncidentListClient({ incidents }: IncidentListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importIncidentsAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} incidents${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} incidents failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import incidents',
        variant: 'destructive'
      });
    }
  };

  const validateIncidentRow = (row: any) => {
    const errors = [];

    // Required fields
    if (!row.title && !row.Title) {
      errors.push('Title is required');
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const severity = (row.severity || row.Severity || '').toLowerCase();
    if (severity && !validSeverities.includes(severity)) {
      errors.push(`Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`);
    }

    // Validate status
    const validStatuses = ['detection', 'containment', 'eradication', 'recovery', 'post_incident', 'closed'];
    const status = (row.status || row.Status || '').toLowerCase();
    if (status && !validStatuses.includes(status)) {
      errors.push(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate date format
    if (row.detectedAt) {
      const date = new Date(row.detectedAt);
      if (isNaN(date.getTime())) {
        errors.push('Invalid detection date format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  // Prepare export data
  const exportData = incidents.map((item) => {
    const incident = item.incident;
    return {
      id: incident.id,
      referenceNumber: incident.referenceNumber,
      title: incident.title,
      description: incident.description || '',
      severity: incident.severity,
      status: incident.status,
      classification: incident.classification,
      detectedAt: new Date(incident.detectedAt).toISOString(),
      containedAt: incident.containedAt ? new Date(incident.containedAt).toISOString() : '',
      resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt).toISOString() : '',
      closedAt: incident.closedAt ? new Date(incident.closedAt).toISOString() : '',
      assignedTo: item.assignee?.name || item.assignee?.email || '',
      reportedBy: item.reporter?.name || item.reporter?.email || '',
      createdAt: new Date(incident.createdAt).toISOString(),
      updatedAt: new Date(incident.updatedAt).toISOString()
    };
  });

  return (
    <div className="mb-4">
      <DataManagementControls
        // Export props
        data={exportData}
        filename={`incidents-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'referenceNumber', label: 'Reference #' },
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'severity', label: 'Severity' },
          { key: 'status', label: 'Status' },
          { key: 'classification', label: 'Classification' },
          { key: 'detectedAt', label: 'Detected At' },
          { key: 'containedAt', label: 'Contained At' },
          { key: 'resolvedAt', label: 'Resolved At' },
          { key: 'closedAt', label: 'Closed At' },
          { key: 'assignedTo', label: 'Assigned To' },
          { key: 'reportedBy', label: 'Reported By' }
        ]}
        // Import props
        entityName="Incidents"
        templateColumns={[
          { key: 'title', label: 'Title', required: true, type: 'string', example: 'Database breach detected' },
          { key: 'description', label: 'Description', type: 'string', example: 'Unauthorized access attempt on production database' },
          { key: 'severity', label: 'Severity', type: 'string', example: 'low, medium, high, critical' },
          { key: 'status', label: 'Status', type: 'string', example: 'detection, containment, eradication, recovery, post_incident, closed' },
          { key: 'classification', label: 'Classification', type: 'string', example: 'security_breach, data_leak, service_disruption, malware, unauthorized_access, other' },
          { key: 'detectedAt', label: 'Detection Date', type: 'date', example: '2024-01-15T10:30:00Z' }
        ]}
        onImport={handleImport}
        validateRow={validateIncidentRow}
        maxRows={500}
      />
    </div>
  );
}