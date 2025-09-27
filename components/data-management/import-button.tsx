'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, FileText, Table, Download, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export type ImportFormat = 'csv' | 'json' | 'excel';

interface ImportButtonProps {
  entityName: string;
  templateData?: any[];
  templateColumns?: {
    key: string;
    label: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date';
    example?: string;
  }[];
  onImport: (data: any[], format: ImportFormat) => Promise<void>;
  validateRow?: (row: any) => { isValid: boolean; errors?: string[] };
  maxRows?: number;
}

export function ImportButton({
  entityName,
  templateData,
  templateColumns,
  onImport,
  validateRow,
  maxRows = 1000
}: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pastedText, setPastedText] = useState('');

  const downloadTemplate = (format: ImportFormat) => {
    if (!templateColumns) return;

    const filename = `${entityName.toLowerCase()}_import_template`;

    if (format === 'csv') {
      // Create CSV template
      const headers = templateColumns.map(col => col.label).join(',');
      const exampleRow = templateColumns.map(col => col.example || '').join(',');
      const csvContent = `${headers}\n${exampleRow}`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      // Create JSON template
      const template = templateData || [
        templateColumns.reduce((obj, col) => {
          obj[col.key] = col.example || (col.type === 'number' ? 0 : '');
          return obj;
        }, {} as any)
      ];

      const jsonString = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      downloadExcelTemplate();
    }
  };

  const downloadExcelTemplate = async () => {
    if (!templateColumns) return;

    try {
      const XLSX = (await import('xlsx')).default;

      const headers = templateColumns.map(col => col.label);
      const exampleRow = templateColumns.map(col => col.example || '');
      const worksheetData = [headers, exampleRow];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, entityName);

      XLSX.writeFile(workbook, `${entityName.toLowerCase()}_import_template.xlsx`);
    } catch (error) {
      console.error('Failed to create Excel template:', error);
      setImportError('Failed to create Excel template');
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length && i <= maxRows; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const parseJSON = (text: string): any[] => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.slice(0, maxRows) : [parsed];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setValidationErrors([]);

    try {
      let data: any[] = [];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        data = parseCSV(text);
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        data = parseJSON(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV, JSON, or Excel.');
      }

      validateAndSetData(data);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse file');
    }
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const XLSX = (await import('xlsx')).default;
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData.slice(0, maxRows));
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
      } catch (error) {
        reject(new Error('Failed to load Excel parser'));
      }
    });
  };

  const handlePastedText = () => {
    if (!pastedText.trim()) return;

    setImportError(null);
    setImportSuccess(null);
    setValidationErrors([]);

    try {
      let data: any[] = [];

      // Try to parse as JSON first
      try {
        data = parseJSON(pastedText);
      } catch {
        // If not JSON, try CSV
        data = parseCSV(pastedText);
      }

      validateAndSetData(data);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to parse pasted data');
    }
  };

  const validateAndSetData = (data: any[]) => {
    if (!data || data.length === 0) {
      setImportError('No data found in file');
      return;
    }

    if (data.length > maxRows) {
      setImportError(`File contains more than ${maxRows} rows. Only first ${maxRows} will be imported.`);
      data = data.slice(0, maxRows);
    }

    // Validate data if validator is provided
    const errors: string[] = [];
    if (validateRow) {
      data.forEach((row, index) => {
        const validation = validateRow(row);
        if (!validation.isValid) {
          errors.push(`Row ${index + 1}: ${validation.errors?.join(', ')}`);
        }
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors.slice(0, 10)); // Show max 10 errors
      if (errors.length > 10) {
        setValidationErrors(prev => [...prev, `...and ${errors.length - 10} more errors`]);
      }
    }

    setParsedData(data);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportError(null);
    setImportSuccess(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const format = fileInputRef.current?.files?.[0]?.name.endsWith('.json') ? 'json' :
                    fileInputRef.current?.files?.[0]?.name.endsWith('.csv') ? 'csv' : 'excel';

      await onImport(parsedData, format);

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportSuccess(`Successfully imported ${parsedData.length} ${entityName.toLowerCase()}(s)`);

      // Reset after success
      setTimeout(() => {
        setIsOpen(false);
        setParsedData([]);
        setPastedText('');
        setImportProgress(0);
        setImportSuccess(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </DropdownMenuItem>
          </DialogTrigger>
          {templateColumns && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => downloadTemplate('csv')}>
                <FileText className="h-4 w-4 mr-2" />
                Download CSV Template
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => downloadTemplate('json')}>
                <FileJson className="h-4 w-4 mr-2" />
                Download JSON Template
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => downloadTemplate('excel')}>
                <Table className="h-4 w-4 mr-2" />
                Download Excel Template
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {entityName}</DialogTitle>
          <DialogDescription>
            Upload a file or paste data to import. Supported formats: CSV, JSON, Excel
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Data</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  CSV, JSON, or Excel (max {maxRows} rows)
                </span>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste CSV or JSON data here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <Button onClick={handlePastedText} disabled={!pastedText.trim()}>
              Parse Data
            </Button>
          </TabsContent>
        </Tabs>

        {parsedData.length > 0 && (
          <Alert>
            <AlertDescription>
              Found {parsedData.length} row(s) ready to import
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Validation Errors:</div>
              <ul className="list-disc list-inside text-sm">
                {validationErrors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}

        {importSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {importSuccess}
            </AlertDescription>
          </Alert>
        )}

        {isImporting && (
          <div className="space-y-2">
            <Progress value={importProgress} />
            <p className="text-sm text-gray-600 text-center">
              Importing... {importProgress}%
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedData.length === 0 || isImporting || validationErrors.length > 0}
          >
            {isImporting ? 'Importing...' : `Import ${parsedData.length} Row(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}