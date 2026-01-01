import React from 'react';
import { useReceiptStatistics } from '../../hooks/useReceiptHistory';
import Spinner from '../common/Spinner';

export const ReceiptStatistics: React.FC = () => {
  const { data: statistics, isLoading, error } = useReceiptStatistics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">Failed to load statistics</p>
      </div>
    );
  }

  if (!statistics) return null;

  const topCategories = Object.entries(statistics.byCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Receipts</div>
          <div className="text-2xl font-bold text-blue-900">{statistics.totalReceipts}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-green-900">
            ${statistics.totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium mb-1">Last 30 Days</div>
          <div className="text-2xl font-bold text-purple-900">
            ${statistics.recentTotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{category}</span>
                    <span className="text-xs text-gray-500">({data.count} receipts)</span>
                  </div>
                  <div className="mt-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(data.total / statistics.totalAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-gray-900">
                  ${data.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
