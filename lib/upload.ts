// Simple file upload utility for evidence files
// In production, this would integrate with cloud storage like AWS S3, CloudFlare R2, etc.

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  // For demo purposes, we'll simulate file upload
  // In production, you would upload to cloud storage

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a mock URL
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const mockUrl = `/uploads/evidence/${timestamp}-${safeName}`;

  return {
    fileName: file.name,
    fileUrl: mockUrl,
    fileSize: file.size,
    fileType: file.type,
  };
}

export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/zip',
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed: ${file.type}. Allowed types: images, PDF, text files, JSON, ZIP`,
    };
  }

  return { valid: true };
}