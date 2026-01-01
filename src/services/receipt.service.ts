import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';
import type { ProcessedReceiptData } from '../types/receipt';

export interface SubmitReceiptRequest {
  imageUrl: string;
  fileName: string;
}

export interface SubmitReceiptResponse {
  receiptId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface ProcessingStatusResponse {
  receiptId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  data?: ProcessedReceiptData;
  error?: string;
}

export const receiptService = {
  // Submit receipt for AI processing
  submitReceipt: async (data: SubmitReceiptRequest) => {
    const response = await apiClient.post<ApiResponse<SubmitReceiptResponse>>(
      '/receipts/process',
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
    const response = await apiClient.post<ApiResponse<SubmitReceiptResponse>>(
      `/receipts/${receiptId}/retry`
    );
    return response.data;
  },

  // Update processed receipt data (after user edits)
  updateReceiptData: async (receiptId: string, data: Partial<ProcessedReceiptData>) => {
    const response = await apiClient.patch<ApiResponse<ProcessedReceiptData>>(
      `/receipts/${receiptId}`,
      data
    );
    return response.data;
  },
};
