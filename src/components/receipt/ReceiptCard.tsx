import React from 'react';
import { format } from 'date-fns';
import type { StoredReceipt } from '../../types/receipt';

interface ReceiptCardProps {
  receipt: StoredReceipt;
  onView: (receipt: StoredReceipt) => void;
  onEdit: (receipt: StoredReceipt) => void;
  onDelete: (receipt: StoredReceipt) => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onView, onEdit, onDelete }) => {
  const { processedData, imageUrl, thumbnailUrl, status, createdAt } = receipt;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer">
      <div onClick={() => onView(receipt)}>
        {/* Receipt Image */}
        <div className="aspect-[3/4] bg-gray-100 rounded-md mb-3 overflow-hidden">
          {(thumbnailUrl || imageUrl) ? (
            <img
              src={thumbnailUrl || imageUrl}
              alt={processedData?.merchant || 'Receipt'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Receipt Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {processedData?.merchant || 'Unknown Merchant'}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
              {status}
            </span>
          </div>

          {processedData?.date && (
            <p className="text-sm text-gray-600">
              {format(new Date(processedData.date), 'MMM d, yyyy')}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {processedData?.currency || '$'}
              {processedData?.total?.toFixed(2) || '0.00'}
            </span>
            {processedData?.category && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                {processedData.category}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Added {format(createdAt, 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(receipt);
          }}
          className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(receipt);
          }}
          className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
