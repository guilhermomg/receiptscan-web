import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';
import type { ProcessedReceiptData } from '../types/receipt';

export interface UploadReceiptResponse {
  receiptId: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ParseReceiptRequest {
  imageUrl: string;
  receiptId?: string;
}

export interface ParseReceiptResponse {
  parsed: ProcessedReceiptData;
  metadata: {
    source: 'openai' | 'google-vision' | 'failed';
    processingTime: number;
    fallbackUsed: boolean;
  };
}

export interface ProcessingStatusResponse {
  receiptId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  data?: ProcessedReceiptData;
  error?: string;
}

export const receiptService = {
  // Upload receipt file
  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await apiClient.post<ApiResponse<UploadReceiptResponse>>(
      '/v1/receipts/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Parse receipt from uploaded image URL
  parseReceipt: async (data: ParseReceiptRequest) => {
    const response = await apiClient.post<ApiResponse<ParseReceiptResponse>>(
      '/v1/receipts/parse',
      data
    );
    return response.data;
  },

  // Get processing status
  getProcessingStatus: async (receiptId: string) => {
    const response = await apiClient.get<ApiResponse<ProcessingStatusResponse>>(
      `/receipts/${receiptId}/status`
    );
    return response.data;
  },

  // Retry failed processing
  retryProcessing: async (receiptId: string) => {
    const response = await apiClient.post<ApiResponse<ParseReceiptResponse>>(
      `/v1/receipts/${receiptId}/retry`
    );
    return response.data;
  },

  // Update processed receipt data (after user edits)
  updateReceiptData: async (receiptId: string, data: Partial<ProcessedReceiptData>) => {
    const response = await apiClient.patch<ApiResponse<ProcessedReceiptData>>(
      `/v1/receipts/${receiptId}`,
      data
    );
    return response.data;
  },
};
