import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/useAuth';
import { receiptHistoryService } from '../services/receipt-history.service';
import type { ProcessedReceiptData, ReceiptFilters, ReceiptSortOptions } from '../types/receipt';

// Query keys
export const receiptHistoryKeys = {
  all: ['receipt-history'] as const,
  lists: () => [...receiptHistoryKeys.all, 'list'] as const,
  list: (filters?: ReceiptFilters, sort?: ReceiptSortOptions) =>
    [...receiptHistoryKeys.lists(), filters, sort] as const,
  detail: (id: string) => [...receiptHistoryKeys.all, 'detail', id] as const,
  statistics: () => [...receiptHistoryKeys.all, 'statistics'] as const,
};

// Hook to get receipts with infinite scroll
export const useReceiptHistory = (filters?: ReceiptFilters, sort?: ReceiptSortOptions) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: receiptHistoryKeys.list(filters, sort),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!user?.uid) throw new Error('User not authenticated');

      return receiptHistoryService.getReceipts({
        filters,
        sort,
        startAfter: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastId : undefined;
    },
    enabled: !!user?.uid,
  });
};

// Hook to get a single receipt
export const useReceipt = (receiptId: string | null) => {
  return useQuery({
    queryKey: receiptHistoryKeys.detail(receiptId || ''),
    queryFn: async () => {
      if (!receiptId) throw new Error('Receipt ID is required');
      return receiptHistoryService.getReceipt(receiptId);
    },
    enabled: !!receiptId,
  });
};

// Hook to create a receipt
export const useCreateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receipt: {
      imageUrl: string;
      fileName: string;
      processedData?: ProcessedReceiptData;
    }) => {
      return receiptHistoryService.createReceipt(receipt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics() });
    },
  });
};

// Hook to update a receipt
export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiptId,
      updates,
    }: {
      receiptId: string;
      updates: Partial<{
        merchant: string;
        date: string;
        total: number;
        subtotal: number;
        tax: number;
        currency: string;
        category: string;
        tags: string[];
      }>;
    }) => {
      return receiptHistoryService.updateReceipt(receiptId, updates);
    },
    onSuccess: (_, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics() });
    },
  });
};

// Hook to update processed data
export const useUpdateReceiptData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiptId,
      processedData,
    }: {
      receiptId: string;
      processedData: ProcessedReceiptData;
    }) => {
      return receiptHistoryService.updateProcessedData(receiptId, processedData);
    },
    onSuccess: (_, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics() });
    },
  });
};

// Hook to delete a receipt
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) => receiptHistoryService.deleteReceipt(receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics() });
    },
  });
};

// Hook to get statistics
export const useReceiptStatistics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: receiptHistoryKeys.statistics(),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return receiptHistoryService.getStatistics();
    },
    enabled: !!user?.uid,
  });
};
