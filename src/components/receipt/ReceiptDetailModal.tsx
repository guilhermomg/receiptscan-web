import React from 'react';
import { format, isValid } from 'date-fns';
import Modal from '../common/Modal';
import { TouchableImage } from '../common';
import type { StoredReceipt } from '../../types/receipt';

interface ReceiptDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: StoredReceipt | null;
  onEdit: (receipt: StoredReceipt) => void;
  onDelete: (receipt: StoredReceipt) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onEdit,
  onDelete,
}) => {
  if (!receipt) return null;

  const { processedData, imageUrl, status, createdAt } = receipt;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 70) {
      return <span className="text-green-600 text-xs">✓ {confidence}%</span>;
    } else if (confidence >= 50) {
      return <span className="text-yellow-600 text-xs">~ {confidence}%</span>;
    } else {
      return <span className="text-red-600 text-xs">! {confidence}%</span>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Details" size="lg">
      <div className="space-y-4 sm:space-y-6">
        {/* Receipt Image */}
        <div className="bg-gray-50 rounded-lg overflow-hidden" style={{ height: '300px' }}>
          <TouchableImage
            src={imageUrl}
            alt={processedData?.merchant || 'Receipt'}
            className="w-full h-full"
          />
        </div>

        {/* Status and Dates */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
          <div>
            <span className="font-medium">Status:</span>{' '}
            <span
              className={`px-2 py-1 rounded text-xs ${
                status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="text-xs sm:text-sm">
            <span className="font-medium">Added:</span> {format(createdAt, 'MMM d, yyyy h:mm a')}
          </div>
        </div>

        {processedData && (
          <>
            {/* Merchant */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Merchant
              </label>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="text-base sm:text-lg font-semibold">{processedData.merchant}</span>
                {getConfidenceBadge(processedData.merchantConfidence)}
              </div>
            </div>

            {/* Date and Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
                  <span>
                    {processedData.date && isValid(new Date(processedData.date))
                      ? format(new Date(processedData.date), 'MMM d, yyyy')
                      : 'Invalid date'}
                  </span>
                  {getConfidenceBadge(processedData.dateConfidence)}
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Total
                </label>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-base sm:text-lg font-bold">
                    {processedData.currency || '$'}
                    {processedData.total.toFixed(2)}
                  </span>
                  {getConfidenceBadge(processedData.totalConfidence)}
                </div>
              </div>
            </div>

            {/* Category and Payment Method */}
            {(processedData.category || processedData.paymentMethod) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {processedData.category && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <div className="p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {processedData.category}
                    </div>
                  </div>
                )}
                {processedData.paymentMethod && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <div className="p-2 sm:p-3 bg-purple-50 text-purple-700 rounded-lg text-sm">
                      {processedData.paymentMethod}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtotal and Tax */}
            {(processedData.subtotal || processedData.tax) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {processedData.subtotal && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Subtotal
                    </label>
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
                      {processedData.currency || '$'}
                      {processedData.subtotal.toFixed(2)}
                    </div>
                  </div>
                )}
                {processedData.tax && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Tax
                    </label>
                    <div className="p-2 sm:p-3 bg-gray-50 rounded-lg text-sm">
                      {processedData.currency || '$'}
                      {processedData.tax.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Line Items */}
            {processedData.items && processedData.items.length > 0 && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {processedData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-xs text-gray-600">
                          Qty: {item.quantity} × {processedData.currency || '$'}
                          {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {processedData.currency || '$'}
                          {(item.quantity * item.price).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{item.confidence}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onEdit(receipt);
              onClose();
            }}
            className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Edit Receipt
          </button>
          <button
            onClick={() => {
              onDelete(receipt);
              onClose();
            }}
            className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Delete Receipt
          </button>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
