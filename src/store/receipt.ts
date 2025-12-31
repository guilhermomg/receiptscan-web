import { create } from 'zustand';
import type { Receipt, ProcessedReceiptData } from '../types/receipt';

interface ReceiptUploadState {
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  removeReceipt: (id: string) => void;
  clearReceipts: () => void;
  setReceipts: (receipts: Receipt[]) => void;
  setProcessedData: (id: string, data: ProcessedReceiptData) => void;
}

export const useReceiptUploadStore = create<ReceiptUploadState>((set) => ({
  receipts: [],
  addReceipt: (receipt) =>
    set((state) => ({
      receipts: [...state.receipts, receipt],
    })),
  updateReceipt: (id, updates) =>
    set((state) => ({
      receipts: state.receipts.map((receipt) =>
        receipt.id === id ? { ...receipt, ...updates } : receipt
      ),
    })),
  removeReceipt: (id) =>
    set((state) => ({
      receipts: state.receipts.filter((receipt) => receipt.id !== id),
    })),
  clearReceipts: () => set({ receipts: [] }),
  setReceipts: (receipts) => set({ receipts }),
  setProcessedData: (id, data) =>
    set((state) => ({
      receipts: state.receipts.map((receipt) =>
        receipt.id === id ? { ...receipt, processedData: data, status: 'processed' } : receipt
      ),
    })),
}));
