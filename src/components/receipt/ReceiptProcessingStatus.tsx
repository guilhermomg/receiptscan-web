import React from 'react';
import { Spinner } from '../common';

interface ReceiptProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

const ReceiptProcessingStatus: React.FC<ReceiptProcessingStatusProps> = ({
  status,
  progress,
  error,
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <Spinner size="sm" />
            <span>Waiting to process...</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Spinner size="sm" />
            <span>Processing with AI...</span>
            {progress !== undefined && <span className="text-sm">({progress}%)</span>}
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Processing complete!</span>
          </div>
        );
      case 'failed':
        return (
          <div className="text-red-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Processing failed</span>
            </div>
            {error && <p className="text-sm mt-1 ml-7">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">{getStatusContent()}</div>
  );
};

export default ReceiptProcessingStatus;
