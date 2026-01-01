import React from 'react';
import type { TaxDeductibleData } from '../../types/analytics';

interface TaxDeductibleSummaryProps {
  data: TaxDeductibleData;
}

export const TaxDeductibleSummary: React.FC<TaxDeductibleSummaryProps> = ({ data }) => {
  const categoryEntries = Object.entries(data.categories).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Tax-Deductible Expenses</h2>
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Total Summary */}
      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="text-sm text-green-600 font-medium mb-1">Total Tax-Deductible</div>
        <div className="text-3xl font-bold text-green-900">${data.totalAmount.toFixed(2)}</div>
        <div className="text-sm text-green-700 mt-1">{data.count} qualifying expenses</div>
      </div>

      {/* Categories Breakdown */}
      {categoryEntries.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">By Category</h3>
          <div className="space-y-3">
            {categoryEntries.map(([category, amount]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(amount / data.totalAmount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No tax-deductible expenses in selected period
        </p>
      )}

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> These are estimated tax-deductible expenses based on categories.
          Please consult with a tax professional for accurate filing.
        </p>
      </div>
    </div>
  );
};
