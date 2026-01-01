import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/useAuth';
import { receiptHistoryService } from '../services/receipt-history.service';
import type { StoredReceipt, ProcessedReceiptData, ReceiptFilters, ReceiptSortOptions } from '../types/receipt';
import { DocumentSnapshot } from 'firebase/firestore';

// Query keys
export const receiptHistoryKeys = {
  all: ['receipt-history'] as const,
  lists: () => [...receiptHistoryKeys.all, 'list'] as const,
  list: (userId: string, filters?: ReceiptFilters, sort?: ReceiptSortOptions) =>
    [...receiptHistoryKeys.lists(), userId, filters, sort] as const,
  detail: (id: string) => [...receiptHistoryKeys.all, 'detail', id] as const,
  statistics: (userId: string) => [...receiptHistoryKeys.all, 'statistics', userId] as const,
};

// Hook to get receipts with infinite scroll
export const useReceiptHistory = (
  filters?: ReceiptFilters,
  sort?: ReceiptSortOptions
) => {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: receiptHistoryKeys.list(user?.uid || '', filters, sort),
    queryFn: async ({ pageParam }: { pageParam: DocumentSnapshot | undefined }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      
      return receiptHistoryService.getReceipts({
        userId: user.uid,
        filters,
        sort,
        lastDoc: pageParam,
      });
    },
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (receipt: Omit<StoredReceipt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return receiptHistoryService.createReceipt({
        ...receipt,
        userId: user.uid,
      } as Omit<StoredReceipt, 'id'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics(user?.uid || '') });
    },
  });
};

// Hook to update a receipt
export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      receiptId,
      updates,
    }: {
      receiptId: string;
      updates: Partial<Omit<StoredReceipt, 'id' | 'userId'>>;
    }) => {
      return receiptHistoryService.updateReceipt(receiptId, updates);
    },
    onSuccess: (_, { receiptId }) => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics(user?.uid || '') });
    },
  });
};

// Hook to update processed data
export const useUpdateReceiptData = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics(user?.uid || '') });
    },
  });
};

// Hook to delete a receipt
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (receiptId: string) => receiptHistoryService.deleteReceipt(receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: receiptHistoryKeys.statistics(user?.uid || '') });
    },
  });
};

// Hook to get statistics
export const useReceiptStatistics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: receiptHistoryKeys.statistics(user?.uid || ''),
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return receiptHistoryService.getStatistics(user.uid);
    },
    enabled: !!user?.uid,
  });
};
