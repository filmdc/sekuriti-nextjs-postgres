'use client';

import { DataManagementControls } from '@/components/data-management/data-management-controls';
import { importTagsAction } from '@/lib/actions/data-import';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface TagListClientProps {
  tags: any[];
}

export function TagListClient({ tags }: TagListClientProps) {
  const router = useRouter();

  const handleImport = async (data: any[], format: 'csv' | 'json' | 'excel') => {
    try {
      const result = await importTagsAction(data, format);

      if (result.success > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.success} tags${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        });
        router.refresh();
      }

      if (result.failed > 0 && result.errors) {
        const errorMessages = result.errors.slice(0, 3).map(e => e.error).join(', ');
        toast({
          title: 'Import Partially Failed',
          description: `${result.failed} tags failed to import: ${errorMessages}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import tags',
        variant: 'destructive'
      });
    }
  };

  const validateTagRow = (row: any) => {
    const errors = [];

    if (!row.name && !row.Name) {
      errors.push('Name is required');
    }

    // Validate color format (hex)
    const color = row.color || row.Color;
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push('Color must be a valid hex code (e.g., #FF0000)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  };

  const exportData = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color || '#808080',
    description: tag.description || '',
    category: tag.category || 'general',
    isActive: tag.isActive !== false,
    usageCount: tag.usageCount || 0,
    createdAt: new Date(tag.createdAt).toISOString(),
    updatedAt: new Date(tag.updatedAt).toISOString()
  }));

  return (
    <div className="mb-4">
      <DataManagementControls
        data={exportData}
        filename={`tags-${new Date().toISOString().split('T')[0]}`}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'color', label: 'Color' },
          { key: 'description', label: 'Description' },
          { key: 'category', label: 'Category' },
          { key: 'isActive', label: 'Active', formatter: (v) => v ? 'Yes' : 'No' },
          { key: 'usageCount', label: 'Usage Count' }
        ]}
        entityName="Tags"
        templateColumns={[
          { key: 'name', label: 'Name', required: true, type: 'string', example: 'Critical' },
          { key: 'color', label: 'Color (Hex)', type: 'string', example: '#FF0000' },
          { key: 'description', label: 'Description', type: 'string', example: 'Used for critical items' },
          { key: 'category', label: 'Category', type: 'string', example: 'general, security, compliance' },
          { key: 'isActive', label: 'Active', type: 'boolean', example: 'true or false' }
        ]}
        onImport={handleImport}
        validateRow={validateTagRow}
        maxRows={500}
      />
    </div>
  );
}