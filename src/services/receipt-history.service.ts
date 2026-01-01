import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  StoredReceipt,
  ProcessedReceiptData,
  ReceiptFilters,
  ReceiptSortOptions,
} from '../types/receipt';

const RECEIPTS_COLLECTION = 'receipts';
const PAGE_SIZE = 20;

// Convert Firestore document to StoredReceipt
const docToReceipt = (docSnap: DocumentSnapshot): StoredReceipt | null => {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId,
    imageUrl: data.imageUrl,
    thumbnailUrl: data.thumbnailUrl,
    fileName: data.fileName,
    processedData: data.processedData,
    status: data.status,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    error: data.error,
  };
};

// Convert StoredReceipt to Firestore data
const receiptToDoc = (receipt: Partial<StoredReceipt>) => {
  const doc: any = { ...receipt };
  if (receipt.createdAt) {
    doc.createdAt = Timestamp.fromDate(receipt.createdAt);
  }
  if (receipt.updatedAt) {
    doc.updatedAt = Timestamp.fromDate(receipt.updatedAt);
  }
  delete doc.id; // Remove ID from document data
  return doc;
};

export interface GetReceiptsOptions {
  userId: string;
  filters?: ReceiptFilters;
  sort?: ReceiptSortOptions;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface GetReceiptsResult {
  receipts: StoredReceipt[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export const receiptHistoryService = {
  // Get receipts with filters, sorting, and pagination
  getReceipts: async (options: GetReceiptsOptions): Promise<GetReceiptsResult> => {
    const {
      userId,
      filters = {},
      sort = { field: 'createdAt', direction: 'desc' },
      pageSize = PAGE_SIZE,
      lastDoc,
    } = options;

    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    // Apply filters
    if (filters.category) {
      constraints.push(where('processedData.category', '==', filters.category));
    }

    if (filters.dateFrom) {
      constraints.push(
        where('processedData.date', '>=', filters.dateFrom.toISOString().split('T')[0])
      );
    }

    if (filters.dateTo) {
      constraints.push(
        where('processedData.date', '<=', filters.dateTo.toISOString().split('T')[0])
      );
    }

    // Apply sorting
    let sortField = 'createdAt';
    if (sort.field === 'date') sortField = 'processedData.date';
    else if (sort.field === 'amount') sortField = 'processedData.total';
    else if (sort.field === 'merchant') sortField = 'processedData.merchant';

    constraints.push(orderBy(sortField, sort.direction));

    // Apply pagination
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize + 1)); // Fetch one extra to check if there are more

    const q = query(collection(db, RECEIPTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const receipts: StoredReceipt[] = [];
    const docs = snapshot.docs;

    // Process all but potentially the last doc
    for (let i = 0; i < Math.min(docs.length, pageSize); i++) {
      const receipt = docToReceipt(docs[i]);
      if (receipt) {
        receipts.push(receipt);
      }
    }

    // Apply client-side filters that can't be done in Firestore
    let filteredReceipts = receipts;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredReceipts = receipts.filter((receipt) => {
        const merchant = receipt.processedData?.merchant?.toLowerCase() || '';
        const fileName = receipt.fileName.toLowerCase();
        return merchant.includes(searchLower) || fileName.includes(searchLower);
      });
    }

    if (filters.minAmount !== undefined) {
      filteredReceipts = filteredReceipts.filter(
        (receipt) => (receipt.processedData?.total || 0) >= filters.minAmount!
      );
    }

    if (filters.maxAmount !== undefined) {
      filteredReceipts = filteredReceipts.filter(
        (receipt) => (receipt.processedData?.total || 0) <= filters.maxAmount!
      );
    }

    return {
      receipts: filteredReceipts,
      lastDoc: docs.length > pageSize ? docs[pageSize - 1] : null,
      hasMore: docs.length > pageSize,
    };
  },

  // Get a single receipt by ID
  getReceipt: async (receiptId: string): Promise<StoredReceipt | null> => {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const docSnap = await getDoc(docRef);
    return docToReceipt(docSnap);
  },

  // Create a new receipt
  createReceipt: async (receipt: Omit<StoredReceipt, 'id'>): Promise<string> => {
    const docData = receiptToDoc({
      ...receipt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const docRef = await addDoc(collection(db, RECEIPTS_COLLECTION), docData);
    return docRef.id;
  },

  // Update a receipt
  updateReceipt: async (
    receiptId: string,
    updates: Partial<Omit<StoredReceipt, 'id' | 'userId'>>
  ): Promise<void> => {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    const docData = receiptToDoc({
      ...updates,
      updatedAt: new Date(),
    });
    await updateDoc(docRef, docData);
  },

  // Update processed data
  updateProcessedData: async (
    receiptId: string,
    processedData: ProcessedReceiptData
  ): Promise<void> => {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    await updateDoc(docRef, {
      processedData,
      status: 'completed',
      updatedAt: Timestamp.fromDate(new Date()),
    });
  },

  // Delete a receipt
  deleteReceipt: async (receiptId: string): Promise<void> => {
    const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
    await deleteDoc(docRef);
  },

  // Get receipt statistics
  getStatistics: async (userId: string): Promise<{
    totalReceipts: number;
    totalAmount: number;
    byCategory: Record<string, { count: number; total: number }>;
    recentTotal: number; // Last 30 days
  }> => {
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);
    const receipts = snapshot.docs
      .map((doc) => docToReceipt(doc))
      .filter((r): r is StoredReceipt => r !== null);

    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, r) => sum + (r.processedData?.total || 0), 0);

    const byCategory: Record<string, { count: number; total: number }> = {};
    receipts.forEach((receipt) => {
      const category = receipt.processedData?.category || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, total: 0 };
      }
      byCategory[category].count++;
      byCategory[category].total += receipt.processedData?.total || 0;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTotal = receipts
      .filter((r) => r.createdAt >= thirtyDaysAgo)
      .reduce((sum, r) => sum + (r.processedData?.total || 0), 0);

    return {
      totalReceipts,
      totalAmount,
      byCategory,
      recentTotal,
    };
  },
};
