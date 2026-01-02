import React, { useState, useEffect } from 'react';
import { Button } from '../common';
import ReceiptProcessingStatus from './ReceiptProcessingStatus';
import ReceiptDataDisplay from './ReceiptDataDisplay';
import ReceiptDataEditor from './ReceiptDataEditor';
import {
  useParseReceipt,
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
  const [isEditing, setIsEditing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { setProcessedData, updateReceipt } = useReceiptUploadStore();

  const parseMutation = useParseReceipt();
  const updateMutation = useUpdateReceiptData();

  // Parse receipt when uploadedUrl is available
  useEffect(() => {
    if (receipt.status === 'uploaded' && receipt.uploadedUrl && !receipt.processedData && !isParsing && !parseError) {
      setIsParsing(true);
      updateReceipt(receipt.id, { status: 'processing' });
      
      parseMutation.mutate(
        {
          imageUrl: receipt.uploadedUrl,
          receiptId: receipt.backendReceiptId,
        },
        {
          onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
              const parsedData = response.data.parsed;
              setProcessedData(receipt.id, parsedData);
              updateReceipt(receipt.id, { status: 'processed', processedData: parsedData });
              onProcessingComplete?.(parsedData);
              addToast('Receipt parsed successfully!', 'success');
            } else {
              throw new Error('Parsing failed');
            }
            setIsParsing(false);
          },
          onError: (error) => {
            console.error('Failed to parse receipt:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse receipt';
            setParseError(errorMessage);
            updateReceipt(receipt.id, { status: 'error', error: errorMessage });
            addToast('Failed to parse receipt', 'error');
            setIsParsing(false);
          },
        }
      );
    }
  }, [receipt.status, receipt.uploadedUrl, receipt.processedData, receipt.backendReceiptId, isParsing, parseError, parseMutation, addToast, receipt.id, setProcessedData, updateReceipt, onProcessingComplete]);

  const handleRetry = () => {
    if (receipt.uploadedUrl) {
      setParseError(null);
      setIsParsing(true);
      updateReceipt(receipt.id, { status: 'processing', error: undefined });
      
      parseMutation.mutate(
        {
          imageUrl: receipt.uploadedUrl,
          receiptId: receipt.backendReceiptId,
        },
        {
          onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
              const parsedData = response.data.parsed;
              setProcessedData(receipt.id, parsedData);
              updateReceipt(receipt.id, { status: 'processed', processedData: parsedData });
              addToast('Receipt parsed successfully!', 'success');
            }
            setIsParsing(false);
          },
          onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse receipt';
            setParseError(errorMessage);
            updateReceipt(receipt.id, { status: 'error', error: errorMessage });
            addToast('Failed to retry parsing', 'error');
            setIsParsing(false);
          },
        }
      );
    }
  };

  const handleSaveEdit = (updatedData: Partial<ProcessedReceiptData>) => {
    if (receipt.backendReceiptId) {
      updateMutation.mutate(
        { receiptId: receipt.backendReceiptId, data: updatedData },
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
  if (receipt.status === 'pending' || receipt.status === 'uploading') {
    return null;
  }

  // Show error state
  if (receipt.status === 'error' || parseError) {
    const errorMessage = receipt.error || parseError || 'Unknown error';
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus status="failed" error={errorMessage} />
        <div className="mt-3 flex justify-center">
          <Button size="sm" onClick={handleRetry} disabled={isParsing}>
            {isParsing ? 'Retrying...' : 'Retry Processing'}
          </Button>
        </div>
      </div>
    );
  }

  // Show processing status
  if (receipt.status === 'processing' || isParsing) {
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus status="processing" />
      </div>
    );
  }

  // Show completed data
  if (receipt.status === 'processed' && receipt.processedData) {
    return (
      <div className="mt-4">
        <ReceiptProcessingStatus status="completed" />
        <div className="mt-4">
          <ReceiptDataDisplay data={receipt.processedData} onEdit={() => setIsEditing(true)} />
        </div>
        {isEditing && (
          <ReceiptDataEditor
            data={receipt.processedData}
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

