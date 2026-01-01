import React from 'react';
import type { Receipt } from '../../types/receipt';
import { Button } from '../common';
import ReceiptProcessor from './ReceiptProcessor';

interface ImagePreviewProps {
  receipt: Receipt;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ receipt, onRemove, onRetry }) => {
  const getStatusColor = () => {
    switch (receipt.status) {
      case 'uploaded':
        return 'border-green-500';
      case 'uploading':
        return 'border-blue-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (receipt.status) {
      case 'uploaded':
        return (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'uploading':
        return (
          <svg
            className="w-5 h-5 text-blue-500 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div
      className={`relative border-2 ${getStatusColor()} rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Image */}
      <div className="aspect-video relative bg-gray-100">
        <img src={receipt.preview} alt={receipt.file.name} className="w-full h-full object-cover" />
        {/* Overlay for uploading/error states */}
        {(receipt.status === 'uploading' || receipt.status === 'error') && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{receipt.file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(receipt.file.size)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusIcon()}
            <button
              onClick={() => onRemove(receipt.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {receipt.status === 'uploading' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${receipt.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{receipt.progress}% uploaded</p>
          </div>
        )}

        {/* Error message */}
        {receipt.status === 'error' && receipt.error && (
          <div className="mt-2">
            <p className="text-xs text-red-600">{receipt.error}</p>
            {onRetry && (
              <Button size="sm" onClick={() => onRetry(receipt.id)} className="mt-2 w-full">
                Retry Upload
              </Button>
            )}
          </div>
        )}

        {/* Receipt Processing Integration */}
        {receipt.status === 'uploaded' && <ReceiptProcessor receipt={receipt} />}
      </div>
    </div>
  );
};

export default ImagePreview;
