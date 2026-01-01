import React, { useState } from 'react';
import { subDays } from 'date-fns';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  DateRangeSelector,
  SpendingTrendsChart,
  CategoryBreakdownChart,
  MonthlyComparisonChart,
  TopMerchantsCard,
  TaxDeductibleSummary,
  SpendingAlerts,
  ExportReports,
} from '../components/analytics';
import Spinner from '../components/common/Spinner';

const AnalyticsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useAnalytics({
    dateFrom,
    dateTo,
  });

  const handleDateRangeChange = (newDateFrom: Date, newDateTo: Date) => {
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track your spending patterns, insights, and financial reports
        </p>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Failed to load analytics data</h3>
              <p className="text-red-700 text-sm mt-1">
                Please try again or adjust your date range.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      {!isLoading && !error && analyticsData && (
        <>
          {/* Alerts */}
          {analyticsData.alerts.length > 0 && <SpendingAlerts alerts={analyticsData.alerts} />}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Spending</h3>
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${analyticsData.totalSpending.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {analyticsData.transactionCount} transactions
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average Transaction</h3>
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${analyticsData.averageTransaction.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">per receipt</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Categories</h3>
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {analyticsData.categoryBreakdown.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">spending categories</p>
            </div>
          </div>

          {/* Charts - Main Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trends */}
            {analyticsData.spendingTrends.length > 0 && (
              <SpendingTrendsChart data={analyticsData.spendingTrends} />
            )}

            {/* Category Breakdown */}
            {analyticsData.categoryBreakdown.length > 0 && (
              <CategoryBreakdownChart data={analyticsData.categoryBreakdown} />
            )}
          </div>

          {/* Monthly Comparison - Full Width */}
          {analyticsData.monthlyComparison.length > 0 && (
            <MonthlyComparisonChart data={analyticsData.monthlyComparison} />
          )}

          {/* Bottom Row - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Merchants */}
            <TopMerchantsCard merchants={analyticsData.topMerchants} />

            {/* Tax Deductible Summary */}
            <TaxDeductibleSummary data={analyticsData.taxDeductible} />
          </div>

          {/* Export Reports */}
          <ExportReports analyticsData={analyticsData} dateFrom={dateFrom} dateTo={dateTo} />
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && analyticsData && analyticsData.transactionCount === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">
            There are no receipts in the selected date range. Try adjusting your filters or upload
            some receipts to see analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
