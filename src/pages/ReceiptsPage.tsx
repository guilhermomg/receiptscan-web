import React, { useState } from 'react';
import { useReceiptHistory, useDeleteReceipt } from '../hooks/useReceiptHistory';
import { ReceiptCard } from '../components/receipt/ReceiptCard';
import { SearchAndFilters } from '../components/receipt/SearchAndFilters';
import { ReceiptDetailModal } from '../components/receipt/ReceiptDetailModal';
import { ReceiptEditModal } from '../components/receipt/ReceiptEditModal';
import { DeleteConfirmationModal } from '../components/receipt/DeleteConfirmationModal';
import { ReceiptStatistics } from '../components/receipt/ReceiptStatistics';
import { ExportMenu } from '../components/receipt/ExportMenu';
import Spinner from '../components/common/Spinner';
import { useToast } from '../components/common/useToast';
import type { StoredReceipt, ReceiptFilters, ReceiptSortOptions } from '../types/receipt';
import type { GetReceiptsResult } from '../services/receipt-history.service';

const ReceiptsPage: React.FC = () => {
  const [filters, setFilters] = useState<ReceiptFilters>({});
  const [sort, setSort] = useState<ReceiptSortOptions>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [selectedReceipt, setSelectedReceipt] = useState<StoredReceipt | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<StoredReceipt | null>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReceiptHistory(filters, sort);
  const deleteMutation = useDeleteReceipt();
  const { addToast } = useToast();

  // Flatten all pages of receipts
  const allReceipts = data?.pages.flatMap((page) => (page as GetReceiptsResult).receipts) || [];

  const handleViewReceipt = (receipt: StoredReceipt) => {
    setSelectedReceipt(receipt);
    setIsDetailModalOpen(true);
  };

  const handleEditReceipt = (receipt: StoredReceipt) => {
    setSelectedReceipt(receipt);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (receipt: StoredReceipt) => {
    setReceiptToDelete(receipt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;

    try {
      await deleteMutation.mutateAsync(receiptToDelete.id);
      addToast('Receipt deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setReceiptToDelete(null);
    } catch (error) {
      addToast('Failed to delete receipt', 'error');
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipt History</h1>
          <p className="text-gray-600 mt-1">Manage and search your receipts</p>
        </div>

        <div className="flex gap-3">
          <ExportMenu receipts={allReceipts} />

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <ReceiptStatistics />

      {/* Search and Filters */}
      <SearchAndFilters
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load receipts. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && allReceipts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No receipts found</h3>
          <p className="text-gray-600">
            {Object.keys(filters).length > 0
              ? 'Try adjusting your filters'
              : 'Start by uploading your first receipt'}
          </p>
        </div>
      )}

      {/* Receipts Grid/List */}
      {!isLoading && !error && allReceipts.length > 0 && (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-4'
            }
          >
            {allReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onView={handleViewReceipt}
                onEdit={handleEditReceipt}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Loading...
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ReceiptDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
        onEdit={handleEditReceipt}
        onDelete={handleDeleteClick}
      />

      <ReceiptEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReceiptToDelete(null);
        }}
        receipt={receiptToDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ReceiptsPage;
