import React, { useState, useRef, useEffect } from 'react';
import { exportService } from '../../utils/export.service';
import type { StoredReceipt } from '../../types/receipt';

interface ExportMenuProps {
  receipts: StoredReceipt[];
  disabled?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ receipts, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportCSV = () => {
    exportService.exportToCSV(receipts);
    setIsOpen(false);
  };

  const handleExportPDF = () => {
    exportService.exportToPDF(receipts);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || receipts.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-green-600"
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
              <div>
                <div className="font-medium text-gray-900">Export as CSV</div>
                <div className="text-xs text-gray-500">Spreadsheet format</div>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="font-medium text-gray-900">Export as PDF</div>
                <div className="text-xs text-gray-500">Document format</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
