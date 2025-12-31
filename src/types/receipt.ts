export interface Receipt {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  error?: string;
  compressedFile?: File;
  uploadedUrl?: string;
}

export interface UploadConfig {
  maxSizeBytes: number;
  targetSizeBytes: number;
  allowedFormats: string[];
  maxFiles: number;
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  targetSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/heic'],
  maxFiles: 10,
};
