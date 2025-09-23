'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function ImportAssetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<number>(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      setErrors([]);
      setSuccess(0);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());

    const rows = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    setPreview(rows);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setErrors([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/assets/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        }
        throw new Error(result.error || 'Import failed');
      }

      setSuccess(result.imported);
      toast({
        title: 'Import successful',
        description: `Successfully imported ${result.imported} assets`
      });

      setTimeout(() => {
        router.push('/assets');
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import assets',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Assets</h1>
            <p className="text-muted-foreground">
              Bulk import assets from a CSV file
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing your asset inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </div>

            {file && (
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}

            {success > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Successfully imported {success} assets!
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>Import errors:</div>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>... and {errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Importing...' : 'Import Assets'}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Import Instructions</CardTitle>
            <CardDescription>
              How to prepare your CSV file for import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">CSV Format Requirements:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>File must be in CSV format</li>
                    <li>First row must contain column headers</li>
                    <li>Required columns: name, type, criticality</li>
                    <li>Optional columns: description, location, owner, ip_address, serial_number</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Valid Asset Types:</p>
              <div className="flex flex-wrap gap-2">
                {['Server', 'Workstation', 'Network Device', 'Application', 'Database', 'Cloud Service'].map(type => (
                  <span key={type} className="text-xs bg-muted px-2 py-1 rounded">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Valid Criticality Levels:</p>
              <div className="flex flex-wrap gap-2">
                {['Critical', 'High', 'Medium', 'Low'].map(level => (
                  <span key={level} className="text-xs bg-muted px-2 py-1 rounded">
                    {level}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/assets-template.csv" download>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              First 5 rows of your CSV file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="text-left p-2">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className="border-b">
                      {Object.values(row).map((value: any, i) => (
                        <td key={i} className="p-2">
                          {value || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}