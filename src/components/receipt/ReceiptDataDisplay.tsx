import React from 'react';
import type { ProcessedReceiptData } from '../../types/receipt';

interface ReceiptDataDisplayProps {
  data: ProcessedReceiptData;
  onEdit?: () => void;
}

const ReceiptDataDisplay: React.FC<ReceiptDataDisplayProps> = ({ data, onEdit }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 70) return 'text-green-600';
    if (confidence > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number, label: string) => {
    const isHighConfidence = confidence > 70;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
          isHighConfidence ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {label}: {confidence.toFixed(0)}%
        {isHighConfidence && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Receipt Data</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      {/* Main Info */}
      <div className="p-4 space-y-4">
        {/* Merchant */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Merchant</label>
            {getConfidenceBadge(data.merchantConfidence, 'Confidence')}
          </div>
          <p className="text-lg font-semibold text-gray-900">{data.merchant}</p>
        </div>

        {/* Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Date</label>
            {getConfidenceBadge(data.dateConfidence, 'Confidence')}
          </div>
          <p className="text-gray-900">{formatDate(data.date)}</p>
        </div>

        {/* Total */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Total</label>
            {getConfidenceBadge(data.totalConfidence, 'Confidence')}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.total, data.currency)}
          </p>
        </div>

        {/* Subtotal and Tax if available */}
        {(data.subtotal !== undefined || data.tax !== undefined) && (
          <div className="space-y-2 text-sm">
            {data.subtotal !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatCurrency(data.subtotal, data.currency)}
                </span>
              </div>
            )}
            {data.tax !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(data.tax, data.currency)}</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        {data.items && data.items.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Items</label>
            <div className="space-y-2">
              {data.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span
                        className={`text-xs ${getConfidenceColor(item.confidence)}`}
                        title="Confidence"
                      >
                        {item.confidence.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-2">
                    {formatCurrency(item.price, data.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(data.category || data.paymentMethod) && (
          <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
            {data.category && (
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="text-gray-900 font-medium">{data.category}</span>
              </div>
            )}
            {data.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="text-gray-900 font-medium">{data.paymentMethod}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptDataDisplay;
