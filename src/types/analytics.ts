export interface SpendingTrend {
  date: string;
  amount: number;
  count: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MerchantData {
  merchant: string;
  amount: number;
  count: number;
  lastVisit: string;
}

export interface MonthlyComparison {
  month: string;
  year: number;
  amount: number;
  count: number;
}

export interface TaxDeductibleData {
  totalAmount: number;
  count: number;
  categories: Record<string, number>;
}

export interface SpendingAlert {
  id: string;
  type: 'overspending' | 'unusual' | 'milestone';
  message: string;
  amount?: number;
  timestamp: Date;
}

export interface AnalyticsData {
  spendingTrends: SpendingTrend[];
  categoryBreakdown: CategoryData[];
  topMerchants: MerchantData[];
  monthlyComparison: MonthlyComparison[];
  taxDeductible: TaxDeductibleData;
  alerts: SpendingAlert[];
  totalSpending: number;
  averageTransaction: number;
  transactionCount: number;
}

export interface AnalyticsFilters {
  dateFrom: Date;
  dateTo: Date;
  categories?: string[];
  merchants?: string[];
}

export type ExportFormat = 'pdf' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeSummary?: boolean;
  includeCharts?: boolean;
  includeDetails?: boolean;
}
