'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importCommunicationTemplatesAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface CommunicationListClientProps {
  templates: any[];
}

export function CommunicationListClient({ templates }: CommunicationListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importCommunicationTemplatesAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} templates${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} templates failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import templates',
        variant: 'destructive'
      });
    }
  };

  const validateTemplateRow = (row: any) => {
    const errors = [];

    if (!row.name && !row.Name) {
      errors.push('Name is required');
    }

    const validTypes = ['email', 'sms', 'slack', 'teams', 'webhook'];
    const type = (row.type || row.Type || '').toLowerCase();
    if (type && !validTypes.includes(type)) {
      errors.push(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }

    if (row.variables) {
      try {
        if (typeof row.variables === 'string') {
          JSON.parse(row.variables);
        }
      } catch {
        errors.push('Variables must be valid JSON array');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const exportData = templates.map((template) => ({
    id: template.id,
    name: template.name,
    type: template.type,
    category: template.category || '',
    subject: template.subject || '',
    body: template.body || '',
    variables: Array.isArray(template.variables) ? JSON.stringify(template.variables) : '[]',
    usageCount: template.usageCount || 0,
    lastUsedAt: template.lastUsedAt ? new Date(template.lastUsedAt).toISOString() : '',
    createdAt: new Date(template.createdAt).toISOString(),
    updatedAt: new Date(template.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`communication-templates-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
          { key: 'category', label: 'Category' },
          { key: 'subject', label: 'Subject' },
          { key: 'body', label: 'Body' },
          { key: 'variables', label: 'Variables' },
          { key: 'usageCount', label: 'Usage Count' },
          { key: 'lastUsedAt', label: 'Last Used' }
        ]}
        entityName="Communication Templates"
        templateColumns={[
          { key: 'name', label: 'Name', required: true, type: 'string', example: 'Incident Notification' },
          { key: 'type', label: 'Type', required: true, type: 'string', example: 'email, sms, slack, teams, webhook' },
          { key: 'category', label: 'Category', type: 'string', example: 'incident, maintenance, general' },
          { key: 'subject', label: 'Subject', type: 'string', example: 'Security Incident: {{incident_title}}' },
          { key: 'body', label: 'Body', type: 'string', example: 'An incident has been detected...' },
          { key: 'variables', label: 'Variables (JSON)', type: 'string', example: '["incident_title", "severity", "date"]' }
        ]}
        onImport={handleImport}
        validateRow={validateTemplateRow}
        maxRows={500}
      />
    </div>
  );
}