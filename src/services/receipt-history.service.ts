import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';
import type {
  StoredReceipt,
  ProcessedReceiptData,
  ReceiptFilters,
  ReceiptSortOptions,
} from '../types/receipt';

const PAGE_SIZE = 20;

export interface GetReceiptsOptions {
  filters?: ReceiptFilters;
  sort?: ReceiptSortOptions;
  pageSize?: number;
  startAfter?: string; // Cursor for pagination (document ID)
}

export interface GetReceiptsResult {
  receipts: StoredReceipt[];
  lastId: string | null;
  hasMore: boolean;
}

interface BackendReceipt {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  merchant?: string;
  date?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
}

// Convert backend receipt to StoredReceipt format
const backendToStoredReceipt = (backendReceipt: BackendReceipt): StoredReceipt => {
  const processedData: ProcessedReceiptData | undefined = backendReceipt.merchant
    ? {
        merchant: backendReceipt.merchant,
        merchantConfidence: 1,
        date: backendReceipt.date || '',
        dateConfidence: 1,
        total: backendReceipt.total || 0,
        totalConfidence: 1,
        subtotal: backendReceipt.subtotal,
        tax: backendReceipt.tax,
        items: (backendReceipt.lineItems || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          confidence: 1,
        })),
        currency: backendReceipt.currency,
        category: backendReceipt.category,
      }
    : undefined;

  return {
    id: backendReceipt.id,
    userId: backendReceipt.userId,
    imageUrl: backendReceipt.imageUrl,
    thumbnailUrl: backendReceipt.thumbnailUrl,
    fileName: backendReceipt.fileName,
    processedData,
    status: backendReceipt.status,
    createdAt: new Date(backendReceipt.createdAt),
    updatedAt: new Date(backendReceipt.updatedAt),
    error: backendReceipt.error,
  };
};

export const receiptHistoryService = {
  // Get receipts with filters, sorting, and pagination
  getReceipts: async (options: GetReceiptsOptions): Promise<GetReceiptsResult> => {
    const {
      filters = {},
      sort = { field: 'createdAt', direction: 'desc' },
      pageSize = PAGE_SIZE,
      startAfter,
    } = options;

    const params: Record<string, string> = {
      limit: pageSize.toString(),
      sortBy: sort.field,
      sortOrder: sort.direction,
    };

    if (startAfter) {
      params.startAfter = startAfter;
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.dateFrom) {
      params.startDate = filters.dateFrom.toISOString();
    }

    if (filters.dateTo) {
      params.endDate = filters.dateTo.toISOString();
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.minAmount !== undefined) {
      params.minAmount = filters.minAmount.toString();
    }

    if (filters.maxAmount !== undefined) {
      params.maxAmount = filters.maxAmount.toString();
    }

    const response = await apiClient.get<
      ApiResponse<{
        receipts: BackendReceipt[];
        pagination: {
          hasMore: boolean;
          lastId: string | null;
          total?: number;
        };
      }>
    >('/v1/receipts', { params });

    if (response.data.status !== 'success' || !response.data.data) {
      throw new Error('Failed to fetch receipts');
    }

    const { receipts: backendReceipts, pagination } = response.data.data;

    return {
      receipts: backendReceipts.map(backendToStoredReceipt),
      lastId: pagination.lastId,
      hasMore: pagination.hasMore,
    };
  },

  // Get a single receipt by ID
  getReceipt: async (receiptId: string): Promise<StoredReceipt | null> => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          receipt: BackendReceipt;
        }>
      >(`/v1/receipts/${receiptId}`);

      if (response.data.status !== 'success' || !response.data.data) {
        return null;
      }

      return backendToStoredReceipt(response.data.data.receipt);
    } catch {
      return null;
    }
  },

  // Create a new receipt
  createReceipt: async (receipt: {
    imageUrl: string;
    fileName: string;
    processedData?: ProcessedReceiptData;
  }): Promise<string> => {
    const requestData: Record<string, unknown> = {
      imageUrl: receipt.imageUrl,
      fileName: receipt.fileName,
    };

    if (receipt.processedData) {
      requestData.merchant = receipt.processedData.merchant;
      requestData.date = receipt.processedData.date;
      requestData.total = receipt.processedData.total;
      requestData.subtotal = receipt.processedData.subtotal;
      requestData.tax = receipt.processedData.tax;
      requestData.currency = receipt.processedData.currency;
      requestData.category = receipt.processedData.category;
      if (receipt.processedData.items?.length) {
        requestData.lineItems = receipt.processedData.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
        }));
      }
    }

    const response = await apiClient.post<
      ApiResponse<{
        receipt: BackendReceipt;
      }>
    >('/v1/receipts', requestData);

    if (response.data.status !== 'success' || !response.data.data) {
      throw new Error('Failed to create receipt');
    }

    return response.data.data.receipt.id;
  },

  // Update a receipt
  updateReceipt: async (
    receiptId: string,
    updates: Partial<{
      merchant: string;
      date: string;
      total: number;
      subtotal: number;
      tax: number;
      currency: string;
      category: string;
      tags: string[];
    }>
  ): Promise<void> => {
    await apiClient.patch(`/v1/receipts/${receiptId}`, updates);
  },

  // Update processed data
  updateProcessedData: async (
    receiptId: string,
    processedData: ProcessedReceiptData
  ): Promise<void> => {
    const updates: Record<string, unknown> = {
      merchant: processedData.merchant,
      date: processedData.date,
      total: processedData.total,
      subtotal: processedData.subtotal,
      tax: processedData.tax,
      currency: processedData.currency,
      category: processedData.category,
    };

    if (processedData.items?.length) {
      updates.lineItems = processedData.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      }));
    }

    await apiClient.patch(`/v1/receipts/${receiptId}`, updates);
  },

  // Delete a receipt
  deleteReceipt: async (receiptId: string): Promise<void> => {
    await apiClient.delete(`/v1/receipts/${receiptId}`);
  },

  // Get receipt statistics
  getStatistics: async (): Promise<{
    totalReceipts: number;
    totalAmount: number;
    byCategory: Record<string, { count: number; total: number }>;
    recentTotal: number; // Last 30 days
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        stats: {
          totalAmount: number;
          count: number;
          byCategory?: Record<string, { amount: number; count: number }>;
          byPeriod?: Record<string, { amount: number; count: number }>;
        };
      }>
    >('/v1/receipts/stats');

    if (response.data.status !== 'success' || !response.data.data) {
      throw new Error('Failed to fetch statistics');
    }

    const { stats } = response.data.data;

    const byCategory: Record<string, { count: number; total: number }> = {};
    if (stats.byCategory) {
      Object.entries(stats.byCategory).forEach(([category, data]) => {
        byCategory[category] = {
          count: data.count,
          total: data.amount,
        };
      });
    }

    // For recent total, we'll need to make a separate request with date filter
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentResponse = await apiClient.get<
      ApiResponse<{
        stats: {
          totalAmount: number;
          count: number;
        };
      }>
    >('/v1/receipts/stats', {
      params: {
        startDate: thirtyDaysAgo.toISOString(),
      },
    });

    const recentTotal =
      recentResponse.data.status === 'success' && recentResponse.data.data
        ? recentResponse.data.data.stats.totalAmount
        : 0;

    return {
      totalReceipts: stats.count,
      totalAmount: stats.totalAmount,
      byCategory,
      recentTotal,
    };
  },
};
