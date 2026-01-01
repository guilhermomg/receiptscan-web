import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import type { AnalyticsData } from '../../types/analytics';
import { format } from 'date-fns';

interface ExportReportsProps {
  analyticsData: AnalyticsData | undefined;
  dateFrom: Date;
  dateTo: Date;
}

export const ExportReports: React.FC<ExportReportsProps> = ({
  analyticsData,
  dateFrom,
  dateTo,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Analytics Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date Range
      doc.setFontSize(12);
      doc.text(
        `Period: ${format(dateFrom, 'MMM dd, yyyy')} - ${format(dateTo, 'MMM dd, yyyy')}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 15;

      // Summary Section
      doc.setFontSize(16);
      doc.text('Summary', 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.text(`Total Spending: $${analyticsData.totalSpending.toFixed(2)}`, 14, yPos);
      yPos += 6;
      doc.text(`Transaction Count: ${analyticsData.transactionCount}`, 14, yPos);
      yPos += 6;
      doc.text(`Average Transaction: $${analyticsData.averageTransaction.toFixed(2)}`, 14, yPos);
      yPos += 12;

      // Category Breakdown
      doc.setFontSize(16);
      doc.text('Category Breakdown', 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      analyticsData.categoryBreakdown.forEach((cat) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`,
          14,
          yPos
        );
        yPos += 6;
      });

      yPos += 8;

      // Top Merchants
      if (analyticsData.topMerchants.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Top Merchants', 14, yPos);
        yPos += 8;

        doc.setFontSize(11);
        analyticsData.topMerchants.slice(0, 5).forEach((merchant) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(
            `${merchant.merchant}: $${merchant.amount.toFixed(2)} (${merchant.count} visits)`,
            14,
            yPos
          );
          yPos += 6;
        });
      }

      // Tax Deductible
      if (analyticsData.taxDeductible.totalAmount > 0) {
        yPos += 8;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.text('Tax-Deductible Expenses', 14, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.text(
          `Total: $${analyticsData.taxDeductible.totalAmount.toFixed(2)} (${analyticsData.taxDeductible.count} expenses)`,
          14,
          yPos
        );
      }

      // Save PDF
      doc.save(`analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvData = [
        ['Analytics Report'],
        [''],
        ['Period', `${format(dateFrom, 'MMM dd, yyyy')} - ${format(dateTo, 'MMM dd, yyyy')}`],
        [''],
        ['Summary'],
        ['Total Spending', analyticsData.totalSpending.toFixed(2)],
        ['Transaction Count', analyticsData.transactionCount],
        ['Average Transaction', analyticsData.averageTransaction.toFixed(2)],
        [''],
        ['Category Breakdown'],
        ['Category', 'Amount', 'Count', 'Percentage'],
        ...analyticsData.categoryBreakdown.map((cat) => [
          cat.category,
          cat.amount.toFixed(2),
          cat.count,
          `${cat.percentage.toFixed(1)}%`,
        ]),
        [''],
        ['Top Merchants'],
        ['Merchant', 'Amount', 'Visits', 'Last Visit'],
        ...analyticsData.topMerchants.map((merchant) => [
          merchant.merchant,
          merchant.amount.toFixed(2),
          merchant.count,
          merchant.lastVisit,
        ]),
        [''],
        ['Tax-Deductible Expenses'],
        ['Total Amount', analyticsData.taxDeductible.totalAmount.toFixed(2)],
        ['Count', analyticsData.taxDeductible.count],
        [''],
        ['By Category'],
        ...Object.entries(analyticsData.taxDeductible.categories).map(([cat, amount]) => [
          cat,
          amount.toFixed(2),
        ]),
      ];

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Reports</h2>
      <p className="text-sm text-gray-600 mb-4">
        Download your analytics data in PDF or CSV format
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportToPDF}
          disabled={!analyticsData || isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
        <button
          onClick={exportToCSV}
          disabled={!analyticsData || isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isExporting ? 'Exporting...' : 'Export as CSV'}
        </button>
      </div>
    </div>
  );
};
