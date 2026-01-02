import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../common';
import CameraCapture from './CameraCapture';
import ImagePreview from './ImagePreview';
import { useReceiptUploadStore } from '../../store/receipt';
import type { Receipt } from '../../types/receipt';
import { DEFAULT_UPLOAD_CONFIG } from '../../types/receipt';
import {
  validateImage,
  compressImage,
  generatePreviewUrl,
  generateReceiptId,
  revokePreviewUrl,
} from '../../utils/imageUtils';
import { useToast } from '../common';
import { useUploadReceipt } from '../../hooks/useReceipt';

interface ReceiptUploadProps {
  onUploadComplete?: (receipts: Receipt[]) => void;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onUploadComplete: _onUploadComplete }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();
  const uploadMutation = useUploadReceipt();

  const { receipts, addReceipt, updateReceipt, removeReceipt, clearReceipts } =
    useReceiptUploadStore();

  const processFile = useCallback(
    async (file: File) => {
      // Validate file
      const validation = validateImage(file);
      if (!validation.valid) {
        addToast(validation.error || 'Invalid file', 'error');
        return;
      }

      // Check max files limit
      if (receipts.length >= DEFAULT_UPLOAD_CONFIG.maxFiles) {
        addToast(`Maximum ${DEFAULT_UPLOAD_CONFIG.maxFiles} files allowed`, 'error');
        return;
      }

      const receiptId = generateReceiptId();
      const preview = generatePreviewUrl(file);

      // Add receipt to store with pending status
      const receipt: Receipt = {
        id: receiptId,
        file,
        preview,
        status: 'pending',
        progress: 0,
      };
      addReceipt(receipt);

      try {
        // Compress image
        updateReceipt(receiptId, { status: 'uploading', progress: 30 });
        const compressedFile = await compressImage(file);

        updateReceipt(receiptId, {
          compressedFile,
          progress: 50,
        });

        // Upload to backend
        const uploadResponse = await uploadMutation.mutateAsync(compressedFile);

        if (uploadResponse.status === 'success' && uploadResponse.data) {
          updateReceipt(receiptId, {
            status: 'uploaded',
            progress: 100,
            uploadedUrl: uploadResponse.data.fileUrl,
            backendReceiptId: uploadResponse.data.receiptId,
          });

          addToast('Receipt uploaded successfully!', 'success');
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error processing receipt:', error);
        updateReceipt(receiptId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to process image',
        });
        addToast('Failed to upload receipt', 'error');
      }
    },
    [receipts.length, addReceipt, updateReceipt, addToast, uploadMutation]
  );

  const handleFileDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsProcessing(true);
      for (const file of acceptedFiles) {
        await processFile(file);
      }
      setIsProcessing(false);
    },
    [processFile]
  );

  const handleCameraCapture = useCallback(
    async (file: File) => {
      setShowCamera(false);
      setIsProcessing(true);
      await processFile(file);
      setIsProcessing(false);
    },
    [processFile]
  );

  const handleRemove = useCallback(
    (id: string) => {
      const receipt = receipts.find((r) => r.id === id);
      if (receipt) {
        revokePreviewUrl(receipt.preview);
        removeReceipt(id);
        addToast('Receipt removed', 'info');
      }
    },
    [receipts, removeReceipt, addToast]
  );

  const handleRetry = useCallback(
    async (id: string) => {
      const receipt = receipts.find((r) => r.id === id);
      if (receipt) {
        updateReceipt(id, { status: 'pending', progress: 0, error: undefined });
        await processFile(receipt.file);
      }
    },
    [receipts, updateReceipt, processFile]
  );

  const handleClearAll = useCallback(() => {
    receipts.forEach((receipt) => {
      revokePreviewUrl(receipt.preview);
    });
    clearReceipts();
    addToast('All receipts cleared', 'info');
  }, [receipts, clearReceipts, addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
    },
    maxSize: DEFAULT_UPLOAD_CONFIG.maxSizeBytes,
    disabled: isProcessing || receipts.length >= DEFAULT_UPLOAD_CONFIG.maxFiles,
  });

  const hasReceipts = receipts.length > 0;
  const uploadedCount = receipts.filter((r) => r.status === 'uploaded').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing || receipts.length >= DEFAULT_UPLOAD_CONFIG.maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop receipts here' : 'Drag & drop receipt images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to select files (JPG, PNG, HEIC)</p>
            <p className="text-xs text-gray-400 mt-2">
              Max {DEFAULT_UPLOAD_CONFIG.maxFiles} files, up to{' '}
              {DEFAULT_UPLOAD_CONFIG.maxSizeBytes / (1024 * 1024)}MB each
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowCamera(true);
              }}
              disabled={isProcessing || receipts.length >= DEFAULT_UPLOAD_CONFIG.maxFiles}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Use Camera
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Count and Actions */}
      {hasReceipts && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'} selected
              {uploadedCount > 0 && ` (${uploadedCount} uploaded)`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      )}

      {/* Image Previews */}
      {hasReceipts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {receipts.map((receipt) => (
            <ImagePreview
              key={receipt.id}
              receipt={receipt}
              onRemove={handleRemove}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
};

export default ReceiptUpload;
