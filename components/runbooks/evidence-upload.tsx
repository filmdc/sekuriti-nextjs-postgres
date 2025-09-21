'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uploadFiles, validateFile } from '@/lib/upload';
import { toast } from '@/components/ui/toast';

interface EvidenceFile {
  id: string;
  file: File;
  description: string;
  uploadProgress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

interface EvidenceUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (evidence: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    description: string;
  }>) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function EvidenceUpload({
  open,
  onOpenChange,
  onUpload,
  maxFiles = 5,
  maxFileSize = 10,
}: EvidenceUploadProps) {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: EvidenceFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Check if we haven't exceeded max files
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        break;
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        description: '',
        uploadProgress: 0,
        uploaded: false,
      });
    }

    if (errors.length > 0) {
      toast.error(`File validation errors: ${errors.join(', ')}`);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${newFiles.length} files for upload`);
    }
  };

  const updateFileDescription = (fileId: string, description: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, description } : f))
    );
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadEvidenceFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Update progress for each file
      const fileObjects = files.map(f => f.file);

      // Simulate upload progress
      for (let progress = 0; progress <= 90; progress += 10) {
        setFiles(prev =>
          prev.map(f => ({ ...f, uploadProgress: progress }))
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload files
      const uploadedFiles = await uploadFiles(fileObjects);

      // Complete progress
      setFiles(prev =>
        prev.map(f => ({ ...f, uploadProgress: 100, uploaded: true }))
      );

      // Prepare evidence data
      const uploadedEvidence = uploadedFiles.map((uploadedFile, index) => ({
        fileName: uploadedFile.fileName,
        fileUrl: uploadedFile.fileUrl,
        fileSize: uploadedFile.fileSize,
        fileType: uploadedFile.fileType,
        description: files[index].description,
      }));

      await onUpload(uploadedEvidence);
      toast.success(`Successfully uploaded ${uploadedEvidence.length} files`);

      // Reset state
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Evidence</DialogTitle>
          <DialogDescription>
            Upload files, screenshots, or documents that provide evidence for this step execution.
            Maximum {maxFiles} files, {maxFileSize}MB each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to select files or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Images, PDFs, documents up to {maxFileSize}MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.log"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Files</Label>
              {files.map((evidenceFile) => (
                <Card key={evidenceFile.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(evidenceFile.file.type)}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{evidenceFile.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(evidenceFile.file.size)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {evidenceFile.uploaded && (
                              <Badge variant="secondary">Uploaded</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(evidenceFile.id)}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`desc-${evidenceFile.id}`} className="text-xs">
                            Description (optional)
                          </Label>
                          <Textarea
                            id={`desc-${evidenceFile.id}`}
                            placeholder="Describe what this evidence shows..."
                            value={evidenceFile.description}
                            onChange={(e) => updateFileDescription(evidenceFile.id, e.target.value)}
                            disabled={isUploading}
                            rows={2}
                            className="mt-1"
                          />
                        </div>

                        {isUploading && evidenceFile.uploadProgress > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Uploading...</span>
                              <span>{evidenceFile.uploadProgress}%</span>
                            </div>
                            <Progress value={evidenceFile.uploadProgress} className="h-1" />
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={uploadEvidenceFiles}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}