'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Table } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns?: {
    key: string;
    label: string;
    formatter?: (value: any) => string;
  }[];
  onExport?: (format: ExportFormat) => void;
}

export function ExportButton({
  data,
  filename,
  columns,
  onExport
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    let csvContent = '';

    // If columns are defined, use them; otherwise use all keys from first object
    const headers = columns
      ? columns.map(col => col.label)
      : Object.keys(data[0]);

    csvContent += headers.join(',') + '\n';

    // Add data rows
    data.forEach(row => {
      const values = columns
        ? columns.map(col => {
            const value = row[col.key];
            const formatted = col.formatter ? col.formatter(value) : value;
            // Escape values containing commas or quotes
            return typeof formatted === 'string' && (formatted.includes(',') || formatted.includes('"'))
              ? `"${formatted.replace(/"/g, '""')}"`
              : formatted;
          })
        : Object.values(row).map(val => {
            const value = val?.toString() || '';
            return value.includes(',') || value.includes('"')
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) return;

    // If columns are defined, filter data to only include specified keys
    const exportData = columns
      ? data.map(row => {
          const filteredRow: any = {};
          columns.forEach(col => {
            filteredRow[col.key] = row[col.key];
          });
          return filteredRow;
        })
      : data;

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Dynamic import for xlsx library
      const XLSX = (await import('xlsx')).default;

      if (!data || data.length === 0) return;

      // Prepare data for Excel
      const worksheetData = columns
        ? [
            columns.map(col => col.label), // Header row
            ...data.map(row =>
              columns.map(col => {
                const value = row[col.key];
                return col.formatter ? col.formatter(value) : value;
              })
            )
          ]
        : [
            Object.keys(data[0]), // Header row
            ...data.map(row => Object.values(row))
          ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Write file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'excel':
        exportToExcel();
        break;
    }
    onExport?.(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!data || data.length === 0 || isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <Table className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}