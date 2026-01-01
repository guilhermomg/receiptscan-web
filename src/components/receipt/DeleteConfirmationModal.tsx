import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { StoredReceipt } from '../../types/receipt';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: StoredReceipt | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onConfirm,
  isDeleting = false,
}) => {
  if (!receipt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Receipt" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Are you sure?</h4>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            You are about to delete the receipt from{' '}
            <span className="font-semibold">
              {receipt.processedData?.merchant || 'Unknown Merchant'}
            </span>
            {receipt.processedData?.total !== undefined && (
              <span>
                {' '}
                for{' '}
                <span className="font-semibold">
                  {receipt.processedData.currency || '$'}
                  {receipt.processedData.total.toFixed(2)}
                </span>
              </span>
            )}
            .
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting} className="flex-1">
            {isDeleting ? 'Deleting...' : 'Delete Receipt'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
