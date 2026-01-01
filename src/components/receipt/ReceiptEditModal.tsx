import React from 'react';
import ReceiptDataEditor from './ReceiptDataEditor';
import { useUpdateReceiptData } from '../../hooks/useReceiptHistory';
import { useToast } from '../common/useToast';
import type { StoredReceipt, ProcessedReceiptData } from '../../types/receipt';

interface ReceiptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: StoredReceipt | null;
}

export const ReceiptEditModal: React.FC<ReceiptEditModalProps> = ({ isOpen, onClose, receipt }) => {
  const updateMutation = useUpdateReceiptData();
  const { addToast } = useToast();

  if (!receipt || !receipt.processedData) return null;

  const handleSave = async (updatedData: Partial<ProcessedReceiptData>) => {
    try {
      await updateMutation.mutateAsync({
        receiptId: receipt.id,
        processedData: {
          ...receipt.processedData!,
          ...updatedData,
        },
      });
      addToast('Receipt updated successfully', 'success');
      onClose();
    } catch {
      addToast('Failed to update receipt', 'error');
    }
  };

  return (
    <ReceiptDataEditor
      data={receipt.processedData}
      onSave={handleSave}
      onCancel={onClose}
      isOpen={isOpen}
      isSaving={updateMutation.isPending}
    />
  );
};
