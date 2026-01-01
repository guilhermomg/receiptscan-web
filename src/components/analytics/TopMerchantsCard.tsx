import React from 'react';
import type { MerchantData } from '../../types/analytics';
import { format, parseISO } from 'date-fns';

interface TopMerchantsCardProps {
  merchants: MerchantData[];
}

export const TopMerchantsCard: React.FC<TopMerchantsCardProps> = ({ merchants }) => {
  if (merchants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Merchants</h2>
        <p className="text-gray-500 text-center py-8">No merchant data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Merchants</h2>
      <div className="space-y-4">
        {merchants.map((merchant, index) => (
          <div key={merchant.merchant} className="flex items-center gap-4">
            {/* Rank */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : index === 1
                    ? 'bg-gray-100 text-gray-700'
                    : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-50 text-blue-700'
              }`}
            >
              {index + 1}
            </div>

            {/* Merchant Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">{merchant.merchant}</h3>
                <span className="text-sm font-bold text-gray-900">
                  ${merchant.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{merchant.count} visits</span>
                <span>Last: {format(parseISO(merchant.lastVisit), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
