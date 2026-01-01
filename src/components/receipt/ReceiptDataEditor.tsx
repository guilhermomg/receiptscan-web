import React, { useState } from 'react';
import { Button, Modal } from '../common';
import type { ProcessedReceiptData, ReceiptItem } from '../../types/receipt';

interface ReceiptDataEditorProps {
  data: ProcessedReceiptData;
  onSave: (updatedData: Partial<ProcessedReceiptData>) => void;
  onCancel: () => void;
  isOpen: boolean;
  isSaving?: boolean;
}

const ReceiptDataEditor: React.FC<ReceiptDataEditorProps> = ({
  data,
  onSave,
  onCancel,
  isOpen,
  isSaving = false,
}) => {
  const [editedData, setEditedData] = useState<ProcessedReceiptData>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedData);
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...editedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setEditedData({ ...editedData, items: newItems });
  };

  const addItem = () => {
    setEditedData({
      ...editedData,
      items: [...editedData.items, { description: '', quantity: 1, price: 0, confidence: 100 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = editedData.items.filter((_, i) => i !== index);
    setEditedData({ ...editedData, items: newItems });
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Edit Receipt Data">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Merchant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
          <input
            type="text"
            value={editedData.merchant}
            onChange={(e) => setEditedData({ ...editedData, merchant: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={editedData.date}
            onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Total */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
          <input
            type="number"
            step="0.01"
            value={editedData.total}
            onChange={(e) => setEditedData({ ...editedData, total: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Subtotal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtotal (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={editedData.subtotal || ''}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                subtotal: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Tax */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax (Optional)</label>
          <input
            type="number"
            step="0.01"
            value={editedData.tax || ''}
            onChange={(e) =>
              setEditedData({
                ...editedData,
                tax: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Items</label>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              + Add Item
            </Button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {editedData.items.map((item, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category (Optional)
          </label>
          <input
            type="text"
            value={editedData.category || ''}
            onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method (Optional)
          </label>
          <input
            type="text"
            value={editedData.paymentMethod || ''}
            onChange={(e) => setEditedData({ ...editedData, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceiptDataEditor;
