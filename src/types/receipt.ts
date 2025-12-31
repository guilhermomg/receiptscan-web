export interface ReceiptItem {
  description: string;
  quantity: number;
  price: number;
  confidence: number;
}

export interface ProcessedReceiptData {
  merchant: string;
  merchantConfidence: number;
  date: string;
  dateConfidence: number;
  total: number;
  totalConfidence: number;
  subtotal?: number;
  tax?: number;
  items: ReceiptItem[];
  currency?: string;
  category?: string;
  paymentMethod?: string;
}

export interface Receipt {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';
  progress: number;
  error?: string;
  compressedFile?: File;
  uploadedUrl?: string;
  processedData?: ProcessedReceiptData;
  processingStartedAt?: Date;
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
