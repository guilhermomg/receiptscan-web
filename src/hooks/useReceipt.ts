import { useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptService } from '../services/receipt.service';
import type { ParseReceiptRequest } from '../services/receipt.service';
import type { ProcessedReceiptData } from '../types/receipt';

// Query keys
export const receiptKeys = {
  all: ['receipts'] as const,
  status: (id: string) => [...receiptKeys.all, 'status', id] as const,
};

// Hook to upload receipt file
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => receiptService.uploadReceipt(file),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
};

// Hook to parse receipt
export const useParseReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParseReceiptRequest) => receiptService.parseReceipt(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
};

// Hook to retry failed processing
export const useRetryProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParseReceiptRequest) => receiptService.parseReceipt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
};

// Hook to update receipt data after user edits
export const useUpdateReceiptData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiptId, data }: { receiptId: string; data: Partial<ProcessedReceiptData> }) =>
      receiptService.updateReceiptData(receiptId, data),
    onSuccess: (_, { receiptId }) => {
      // Invalidate status query for this receipt
      queryClient.invalidateQueries({ queryKey: receiptKeys.status(receiptId) });
    },
  });
};
