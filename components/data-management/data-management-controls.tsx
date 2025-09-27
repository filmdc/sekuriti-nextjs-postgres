'use client';

import { ExportButton } from './export-button';
import { ImportButton } from './import-button';

interface DataManagementControlsProps {
  // Export props
  data: any[];
  filename: string;
  columns?: {
    key: string;
    label: string;
    formatter?: (value: any) => string;
  }[];

  // Import props
  entityName: string;
  templateColumns?: {
    key: string;
    label: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date';
    example?: string;
  }[];
  onImport: (data: any[], format: 'csv' | 'json' | 'excel') => Promise<void>;
  validateRow?: (row: any) => { isValid: boolean; errors?: string[] };
  maxRows?: number;

  // Control visibility
  showExport?: boolean;
  showImport?: boolean;
}

export function DataManagementControls({
  data,
  filename,
  columns,
  entityName,
  templateColumns,
  onImport,
  validateRow,
  maxRows,
  showExport = true,
  showImport = true,
}: DataManagementControlsProps) {
  return (
    <div className="flex gap-2">
      {showImport && (
        <ImportButton
          entityName={entityName}
          templateColumns={templateColumns}
          onImport={onImport}
          validateRow={validateRow}
          maxRows={maxRows}
        />
      )}
      {showExport && (
        <ExportButton
          data={data}
          filename={filename}
          columns={columns}
        />
      )}
    </div>
  );
}