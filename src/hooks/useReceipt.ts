import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { receiptService } from '../services/receipt.service';
import type { SubmitReceiptRequest, ProcessingStatusResponse } from '../services/receipt.service';
import type { ProcessedReceiptData } from '../types/receipt';

// Query keys
export const receiptKeys = {
  all: ['receipts'] as const,
  status: (id: string) => [...receiptKeys.all, 'status', id] as const,
};

// Hook to submit receipt for processing
export const useSubmitReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitReceiptRequest) => receiptService.submitReceipt(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
};

// Hook to poll processing status
export const useReceiptProcessingStatus = (
  receiptId: string | null,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: ProcessingStatusResponse) => void;
    onError?: (error: Error) => void;
  }
) => {
  return useQuery({
    queryKey: receiptKeys.status(receiptId || ''),
    queryFn: async () => {
      if (!receiptId) throw new Error('Receipt ID is required');
      const response = await receiptService.getProcessingStatus(receiptId);
      return response.data;
    },
    enabled: !!receiptId && options?.enabled !== false,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 2 seconds if processing or pending
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 2000;
      }
      // Stop polling when completed or failed
      return false;
    },
    retry: 1,
    // Timeout after 60 seconds
    staleTime: 60000,
  });
};

// Hook to retry failed processing
export const useRetryProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => receiptService.retryProcessing(receiptId),
    onSuccess: (_, receiptId) => {
      // Invalidate status query for this receipt
      queryClient.invalidateQueries({ queryKey: receiptKeys.status(receiptId) });
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
