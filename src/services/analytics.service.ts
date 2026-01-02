import apiClient from '../lib/axios';
import type { ApiResponse } from '../types';
import { format } from 'date-fns';
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

export const analyticsService = {
  // Get analytics data with filters
  getAnalyticsData: async (filters: AnalyticsFilters): Promise<AnalyticsData> => {
    // Determine period parameter
    let period: string;
    const daysDiff = Math.floor(
      (filters.dateTo.getTime() - filters.dateFrom.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 31) {
      period = 'this_month';
    } else if (daysDiff <= 365) {
      period = 'ytd';
    } else {
      period = 'custom';
    }

    const params: Record<string, string> = {
      period,
    };

    if (period === 'custom') {
      params.startDate = filters.dateFrom.toISOString();
      params.endDate = filters.dateTo.toISOString();
    }

    // Get analytics from backend
    const response = await apiClient.get<
      ApiResponse<{
        analytics: {
          summary: {
            totalSpending: number;
            averageTransaction: number;
            transactionCount: number;
            taxDeductible: number;
          };
          byCategory: Array<{
            category: string;
            amount: number;
            count: number;
            percentage: number;
          }>;
          monthlyTrends: Array<{
            month: string;
            amount: number;
            count: number;
          }>;
          topMerchants: Array<{
            merchant: string;
            amount: number;
            count: number;
            lastVisit: string;
          }>;
        };
      }>
    >('/v1/receipts/analytics', { params });

    if (response.data.status !== 'success' || !response.data.data) {
      throw new Error('Failed to fetch analytics');
    }

    const { analytics } = response.data.data;

    // Transform backend data to frontend format
    const categoryBreakdown: CategoryData[] = analytics.byCategory.map((cat) => ({
      category: cat.category,
      amount: cat.amount,
      count: cat.count,
      percentage: cat.percentage,
    }));

    const topMerchants: MerchantData[] = analytics.topMerchants.map((merchant) => ({
      merchant: merchant.merchant,
      amount: merchant.amount,
      count: merchant.count,
      lastVisit: merchant.lastVisit,
    }));

    // For spending trends, we'll generate daily data
    const spendingTrends: SpendingTrend[] = [];
    for (let d = new Date(filters.dateFrom); d <= filters.dateTo; d.setDate(d.getDate() + 1)) {
      spendingTrends.push({
        date: format(d, 'yyyy-MM-dd'),
        amount: 0,
        count: 0,
      });
    }

    // Transform monthly trends to MonthlyComparison format
    const monthlyComparison: MonthlyComparison[] = analytics.monthlyTrends.map((trend) => {
      const [year] = trend.month.split('-');
      return {
        month: trend.month,
        year: parseInt(year, 10),
        amount: trend.amount,
        count: trend.count,
      };
    });

    // Calculate tax deductible summary
    const taxDeductible: TaxDeductibleData = {
      totalAmount: analytics.summary.taxDeductible,
      count: 0,
      categories: {},
    };

    // Generate alerts (client-side for now)
    const alerts: SpendingAlert[] = [];

    // High spending alert
    if (monthlyComparison.length >= 2) {
      const current = monthlyComparison[monthlyComparison.length - 1];
      const previous = monthlyComparison[monthlyComparison.length - 2];
      const percentageChange =
        previous.amount > 0 ? ((current.amount - previous.amount) / previous.amount) * 100 : 0;

      if (percentageChange > 20) {
        alerts.push({
          id: 'spending-increase',
          type: 'overspending',
          message: `Your spending is ${percentageChange.toFixed(1)}% higher than last month`,
          amount: current.amount,
          timestamp: new Date(),
        });
      }
    }

    return {
      spendingTrends,
      categoryBreakdown,
      topMerchants,
      monthlyComparison,
      taxDeductible,
      alerts,
      totalSpending: analytics.summary.totalSpending,
      averageTransaction: analytics.summary.averageTransaction,
      transactionCount: analytics.summary.transactionCount,
    };
  },
};
