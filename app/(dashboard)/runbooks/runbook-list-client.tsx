'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importRunbooksAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface RunbookListClientProps {
  runbooks: any[];
}

export function RunbookListClient({ runbooks }: RunbookListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importRunbooksAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} runbooks${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} runbooks failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import runbooks',
        variant: 'destructive'
      });
    }
  };

  const validateRunbookRow = (row: any) => {
    const errors = [];

    if (!row.title && !row.Title) {
      errors.push('Title is required');
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const severity = (row.severity || row.Severity || '').toLowerCase();
    if (severity && !validSeverities.includes(severity)) {
      errors.push(`Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`);
    }

    const validStatuses = ['draft', 'published', 'archived'];
    const status = (row.status || row.Status || '').toLowerCase();
    if (status && !validStatuses.includes(status)) {
      errors.push(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const exportData = runbooks.map((runbook) => ({
    id: runbook.id,
    title: runbook.title,
    description: runbook.description || '',
    category: runbook.category || '',
    severity: runbook.severity || 'medium',
    status: runbook.status || 'draft',
    estimatedDuration: runbook.estimatedDuration || 60,
    executionCount: runbook.executionCount || 0,
    lastExecutedAt: runbook.lastExecutedAt ? new Date(runbook.lastExecutedAt).toISOString() : '',
    stepCount: runbook.steps?.length || 0,
    createdAt: new Date(runbook.createdAt).toISOString(),
    updatedAt: new Date(runbook.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`runbooks-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'description', label: 'Description' },
          { key: 'category', label: 'Category' },
          { key: 'severity', label: 'Severity' },
          { key: 'status', label: 'Status' },
          { key: 'estimatedDuration', label: 'Est. Duration (min)' },
          { key: 'executionCount', label: 'Execution Count' },
          { key: 'stepCount', label: 'Step Count' },
          { key: 'lastExecutedAt', label: 'Last Executed' }
        ]}
        entityName="Runbooks"
        templateColumns={[
          { key: 'title', label: 'Title', required: true, type: 'string', example: 'Database Breach Response' },
          { key: 'description', label: 'Description', type: 'string', example: 'Step-by-step response for database breaches' },
          { key: 'category', label: 'Category', type: 'string', example: 'security, network, data, general' },
          { key: 'severity', label: 'Severity', type: 'string', example: 'low, medium, high, critical' },
          { key: 'status', label: 'Status', type: 'string', example: 'draft, published, archived' },
          { key: 'estimatedDuration', label: 'Est. Duration (min)', type: 'number', example: '60' }
        ]}
        onImport={handleImport}
        validateRow={validateRunbookRow}
        maxRows={500}
      />
    </div>
  );
}