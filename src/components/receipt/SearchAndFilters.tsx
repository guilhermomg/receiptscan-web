import React, { useState, useEffect } from 'react';
import type { ReceiptFilters, ReceiptSortOptions, ReceiptSortField } from '../../types/receipt';

interface SearchAndFiltersProps {
  filters: ReceiptFilters;
  sort: ReceiptSortOptions;
  onFiltersChange: (filters: ReceiptFilters) => void;
  onSortChange: (sort: ReceiptSortOptions) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSortFieldChange = (field: ReceiptSortField) => {
    onSortChange({ ...sort, field });
  };

  const handleSortDirectionToggle = () => {
    onSortChange({
      ...sort,
      direction: sort.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.category || 
    filters.dateFrom || 
    filters.dateTo || 
    filters.minAmount !== undefined || 
    filters.maxAmount !== undefined;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by merchant or file name..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <select
            value={sort.field}
            onChange={(e) => handleSortFieldChange(e.target.value as ReceiptSortField)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Added Date</option>
            <option value="date">Receipt Date</option>
            <option value="amount">Amount</option>
            <option value="merchant">Merchant</option>
          </select>

          <button
            onClick={handleSortDirectionToggle}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={sort.direction === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sort.direction === 'asc' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value || undefined })}
              placeholder="e.g., Food"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateTo: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minAmount !== undefined ? filters.minAmount : ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Min"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={filters.maxAmount !== undefined ? filters.maxAmount : ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Max"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
