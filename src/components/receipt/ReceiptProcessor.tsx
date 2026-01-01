import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import ReceiptProcessingStatus from './ReceiptProcessingStatus';
import ReceiptDataDisplay from './ReceiptDataDisplay';
import ReceiptDataEditor from './ReceiptDataEditor';
import {
  useSubmitReceipt,
  useReceiptProcessingStatus,
  useRetryProcessing,
  useUpdateReceiptData,
} from '../../hooks/useReceipt';
import { useReceiptUploadStore } from '../../store/receipt';
import type { Receipt, ProcessedReceiptData } from '../../types/receipt';
import { useToast } from '../common';

interface ReceiptProcessorProps {
  receipt: Receipt;
  onProcessingComplete?: (data: ProcessedReceiptData) => void;
}

const ReceiptProcessor: React.FC<ReceiptProcessorProps> = ({ receipt, onProcessingComplete }) => {
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { addToast } = useToast();
  const { setProcessedData } = useReceiptUploadStore();

  const submitMutation = useSubmitReceipt();
  const retryMutation = useRetryProcessing();
  const updateMutation = useUpdateReceiptData();

  // Poll for processing status
  const {
    data: statusData,
    isError: isStatusError,
    error: statusError,
  } = useReceiptProcessingStatus(receiptId, {
    enabled: !!receiptId && !hasTimedOut,
  });

  // Submit receipt for processing when uploadedUrl is available
  useEffect(() => {
    if (receipt.status === 'uploaded' && receipt.uploadedUrl && !receiptId) {
      submitMutation.mutate(
        {
          imageUrl: receipt.uploadedUrl,
          fileName: receipt.file.name,
        },
        {
          onSuccess: (response) => {
            setReceiptId(response.data.receiptId);
            addToast('Receipt submitted for AI processing', 'info');
          },
          onError: (error) => {
            console.error('Failed to submit receipt:', error);
            addToast('Failed to submit receipt for processing', 'error');
          },
        }
      );
    }
  }, [receipt.status, receipt.uploadedUrl, receiptId, submitMutation, addToast, receipt.file.name]);

  // Handle timeout after 60 seconds
  useEffect(() => {
    if (receiptId) {
      const timeoutId = setTimeout(() => {
        if (statusData?.status === 'processing' || statusData?.status === 'pending') {
          setHasTimedOut(true);
          addToast(
            'Processing is taking longer than expected. Please check back later.',
            'warning'
          );
        }
      }, 60000);

      return () => clearTimeout(timeoutId);
    }
  }, [receiptId, statusData?.status, addToast]);

  // Handle processing completion
  useEffect(() => {
    if (statusData?.status === 'completed' && statusData.data) {
      setProcessedData(receipt.id, statusData.data);
      onProcessingComplete?.(statusData.data);
      addToast('Receipt processed successfully!', 'success');
    }
  }, [
    statusData?.status,
    statusData?.data,
    onProcessingComplete,
    addToast,
    receipt.id,
    setProcessedData,
  ]);

  const handleRetry = () => {
    if (receiptId) {
      setHasTimedOut(false);
      retryMutation.mutate(receiptId, {
        onSuccess: () => {
          addToast('Retrying processing...', 'info');
        },
        onError: () => {
          addToast('Failed to retry processing', 'error');
        },
      });
    }
  };

  const handleSaveEdit = (updatedData: Partial<ProcessedReceiptData>) => {
    if (receiptId) {
      updateMutation.mutate(
        { receiptId, data: updatedData },
        {
          onSuccess: () => {
            setIsEditing(false);
            addToast('Receipt data updated successfully', 'success');
          },
          onError: () => {
            addToast('Failed to update receipt data', 'error');
          },
        }
      );
    }
  };

  // Don't show anything if receipt hasn't been uploaded yet
  if (receipt.status !== 'uploaded' && !receiptId) {
    return null;
  }

  // Show error state
  if (isStatusError || statusData?.status === 'failed') {
    const errorMessage = statusData?.error || (statusError as Error)?.message || 'Unknown error';
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus status="failed" error={errorMessage} />
        <div className="mt-3 flex justify-center">
          <Button size="sm" onClick={handleRetry} disabled={retryMutation.isPending}>
            {retryMutation.isPending ? 'Retrying...' : 'Retry Processing'}
          </Button>
        </div>
      </div>
    );
  }

  // Show timeout state
  if (hasTimedOut) {
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus
          status="processing"
          error="Processing is taking longer than expected"
        />
        <div className="mt-3 flex justify-center">
          <Button size="sm" onClick={handleRetry} disabled={retryMutation.isPending}>
            {retryMutation.isPending ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
      </div>
    );
  }

  // Show processing status
  if (!statusData || statusData.status === 'pending' || statusData.status === 'processing') {
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus
          status={statusData?.status || 'pending'}
          progress={statusData?.progress}
        />
      </div>
    );
  }

  // Show completed data
  if (statusData.status === 'completed' && statusData.data) {
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus status="completed" />
        <div className="mt-4">
          <ReceiptDataDisplay data={statusData.data} onEdit={() => setIsEditing(true)} />
        </div>
        {isEditing && (
          <ReceiptDataEditor
            data={statusData.data}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            isOpen={isEditing}
            isSaving={updateMutation.isPending}
          />
        )}
      </div>
    );
  }

  return null;
};

export default ReceiptProcessor;
