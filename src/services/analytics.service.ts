import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { subDays, format, parseISO } from 'date-fns';
import type { StoredReceipt } from '../types/receipt';
import type {
  AnalyticsData,
  AnalyticsFilters,
  SpendingTrend,
  CategoryData,
  MerchantData,
  MonthlyComparison,
  TaxDeductibleData,
  SpendingAlert,
} from '../types/analytics';

const RECEIPTS_COLLECTION = 'receipts';

// Tax deductible categories (this can be customized)
const TAX_DEDUCTIBLE_CATEGORIES = [
  'Business',
  'Office Supplies',
  'Travel',
  'Meals & Entertainment',
  'Transportation',
  'Professional Services',
];

// Convert Firestore document to StoredReceipt
const docToReceipt = (doc: any): StoredReceipt => {
  const data = doc.data();
  return {
    id: doc.id,
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

export const analyticsService = {
  // Get analytics data with filters
  getAnalyticsData: async (
    userId: string,
    filters: AnalyticsFilters
  ): Promise<AnalyticsData> => {
    // Query receipts
    const q = query(
      collection(db, RECEIPTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);
    let receipts = snapshot.docs
      .map((doc) => docToReceipt(doc))
      .filter((r): r is StoredReceipt => r !== null);

    // Apply date filters
    receipts = receipts.filter((receipt) => {
      const receiptDate = receipt.processedData?.date
        ? parseISO(receipt.processedData.date)
        : receipt.createdAt;
      return receiptDate >= filters.dateFrom && receiptDate <= filters.dateTo;
    });

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      receipts = receipts.filter((receipt) =>
        filters.categories!.includes(receipt.processedData?.category || 'Uncategorized')
      );
    }

    // Apply merchant filter
    if (filters.merchants && filters.merchants.length > 0) {
      receipts = receipts.filter((receipt) =>
        filters.merchants!.includes(receipt.processedData?.merchant || '')
      );
    }

    // Calculate analytics
    const spendingTrends = calculateSpendingTrends(receipts, filters);
    const categoryBreakdown = calculateCategoryBreakdown(receipts);
    const topMerchants = calculateTopMerchants(receipts);
    const monthlyComparison = calculateMonthlyComparison(receipts);
    const taxDeductible = calculateTaxDeductible(receipts);
    const alerts = generateAlerts(receipts, filters);

    const totalSpending = receipts.reduce(
      (sum, r) => sum + (r.processedData?.total || 0),
      0
    );
    const transactionCount = receipts.length;
    const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

    return {
      spendingTrends,
      categoryBreakdown,
      topMerchants,
      monthlyComparison,
      taxDeductible,
      alerts,
      totalSpending,
      averageTransaction,
      transactionCount,
    };
  },
};

// Calculate daily spending trends
function calculateSpendingTrends(
  receipts: StoredReceipt[],
  filters: AnalyticsFilters
): SpendingTrend[] {
  const trends = new Map<string, { amount: number; count: number }>();

  receipts.forEach((receipt) => {
    const date = receipt.processedData?.date
      ? receipt.processedData.date
      : format(receipt.createdAt, 'yyyy-MM-dd');

    if (!trends.has(date)) {
      trends.set(date, { amount: 0, count: 0 });
    }

    const data = trends.get(date)!;
    data.amount += receipt.processedData?.total || 0;
    data.count += 1;
  });

  // Convert to array and sort by date
  const result: SpendingTrend[] = Array.from(trends.entries())
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Fill in missing dates with zero values
  const filledResult: SpendingTrend[] = [];
  const startDate = new Date(filters.dateFrom);
  const endDate = new Date(filters.dateTo);

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const existing = result.find((t) => t.date === dateStr);
    filledResult.push(
      existing || { date: dateStr, amount: 0, count: 0 }
    );
  }

  return filledResult;
}

// Calculate category breakdown
function calculateCategoryBreakdown(receipts: StoredReceipt[]): CategoryData[] {
  const categories = new Map<string, { amount: number; count: number }>();

  receipts.forEach((receipt) => {
    const category = receipt.processedData?.category || 'Uncategorized';
    if (!categories.has(category)) {
      categories.set(category, { amount: 0, count: 0 });
    }

    const data = categories.get(category)!;
    data.amount += receipt.processedData?.total || 0;
    data.count += 1;
  });

  const totalAmount = receipts.reduce((sum, r) => sum + (r.processedData?.total || 0), 0);

  return Array.from(categories.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Calculate top merchants
function calculateTopMerchants(receipts: StoredReceipt[]): MerchantData[] {
  const merchants = new Map<
    string,
    { amount: number; count: number; lastVisit: Date }
  >();

  receipts.forEach((receipt) => {
    const merchant = receipt.processedData?.merchant || 'Unknown';
    const receiptDate = receipt.processedData?.date
      ? parseISO(receipt.processedData.date)
      : receipt.createdAt;

    if (!merchants.has(merchant)) {
      merchants.set(merchant, { amount: 0, count: 0, lastVisit: receiptDate });
    }

    const data = merchants.get(merchant)!;
    data.amount += receipt.processedData?.total || 0;
    data.count += 1;
    if (receiptDate > data.lastVisit) {
      data.lastVisit = receiptDate;
    }
  });

  return Array.from(merchants.entries())
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      count: data.count,
      lastVisit: format(data.lastVisit, 'yyyy-MM-dd'),
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

// Calculate monthly comparison
function calculateMonthlyComparison(receipts: StoredReceipt[]): MonthlyComparison[] {
  const months = new Map<string, { amount: number; count: number; year: number }>();

  receipts.forEach((receipt) => {
    const receiptDate = receipt.processedData?.date
      ? parseISO(receipt.processedData.date)
      : receipt.createdAt;
    const monthKey = format(receiptDate, 'yyyy-MM');
    const year = receiptDate.getFullYear();

    if (!months.has(monthKey)) {
      months.set(monthKey, { amount: 0, count: 0, year });
    }

    const data = months.get(monthKey)!;
    data.amount += receipt.processedData?.total || 0;
    data.count += 1;
  });

  return Array.from(months.entries())
    .map(([monthKey, data]) => ({
      month: format(parseISO(monthKey + '-01'), 'MMM yyyy'),
      year: data.year,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    });
}

// Calculate tax deductible expenses
function calculateTaxDeductible(receipts: StoredReceipt[]): TaxDeductibleData {
  const categories: Record<string, number> = {};
  let totalAmount = 0;
  let count = 0;

  receipts.forEach((receipt) => {
    const category = receipt.processedData?.category || 'Uncategorized';
    if (TAX_DEDUCTIBLE_CATEGORIES.includes(category)) {
      const amount = receipt.processedData?.total || 0;
      totalAmount += amount;
      count += 1;

      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += amount;
    }
  });

  return {
    totalAmount,
    count,
    categories,
  };
}

// Generate spending alerts
function generateAlerts(
  receipts: StoredReceipt[],
  filters: AnalyticsFilters
): SpendingAlert[] {
  const alerts: SpendingAlert[] = [];

  // Calculate average spending per day
  const daysDiff =
    Math.ceil((filters.dateTo.getTime() - filters.dateFrom.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const totalSpending = receipts.reduce((sum, r) => sum + (r.processedData?.total || 0), 0);
  const avgPerDay = totalSpending / daysDiff;

  // Check for overspending (if last 7 days is 50% more than average)
  const last7Days = receipts.filter((r) => {
    const receiptDate = r.processedData?.date
      ? parseISO(r.processedData.date)
      : r.createdAt;
    return receiptDate >= subDays(filters.dateTo, 7);
  });

  const last7DaysTotal = last7Days.reduce((sum, r) => sum + (r.processedData?.total || 0), 0);
  const last7DaysAvg = last7DaysTotal / 7;

  if (last7DaysAvg > avgPerDay * 1.5 && receipts.length > 7) {
    alerts.push({
      id: 'overspending-1',
      type: 'overspending',
      message: 'Your spending in the last 7 days is 50% higher than your average',
      amount: last7DaysTotal,
      timestamp: new Date(),
    });
  }

  // Milestone alerts
  if (totalSpending >= 10000 && receipts.length >= 100) {
    alerts.push({
      id: 'milestone-1',
      type: 'milestone',
      message: 'You have tracked over $10,000 in expenses!',
      amount: totalSpending,
      timestamp: new Date(),
    });
  } else if (receipts.length >= 50) {
    alerts.push({
      id: 'milestone-2',
      type: 'milestone',
      message: `You have scanned ${receipts.length} receipts!`,
      timestamp: new Date(),
    });
  }

  return alerts;
}
