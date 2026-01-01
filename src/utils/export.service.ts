import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';
import type { StoredReceipt } from '../types/receipt';

export const exportService = {
  // Export receipts to CSV
  exportToCSV: (receipts: StoredReceipt[]) => {
    const data = receipts.map((receipt) => ({
      Date: receipt.processedData?.date
        ? format(new Date(receipt.processedData.date), 'yyyy-MM-dd')
        : '',
      Merchant: receipt.processedData?.merchant || '',
      Amount: receipt.processedData?.total || 0,
      Currency: receipt.processedData?.currency || '$',
      Category: receipt.processedData?.category || '',
      'Payment Method': receipt.processedData?.paymentMethod || '',
      Subtotal: receipt.processedData?.subtotal || '',
      Tax: receipt.processedData?.tax || '',
      'File Name': receipt.fileName,
      Status: receipt.status,
      'Created At': format(receipt.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `receipts_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export receipts to PDF
  exportToPDF: (receipts: StoredReceipt[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Summary', margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, margin, yPosition);
    yPosition += 15;

    // Statistics
    const totalAmount = receipts.reduce(
      (sum, r) => sum + (r.processedData?.total || 0),
      0
    );
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Receipts: ${receipts.length}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, margin, yPosition);
    yPosition += 15;

    // Table Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const headerY = yPosition;
    doc.text('Date', margin, headerY);
    doc.text('Merchant', margin + 35, headerY);
    doc.text('Category', margin + 95, headerY);
    doc.text('Amount', pageWidth - margin - 30, headerY, { align: 'right' });

    // Line under header
    yPosition += 2;
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    receipts.forEach((receipt) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      const date = receipt.processedData?.date
        ? format(new Date(receipt.processedData.date), 'MM/dd/yyyy')
        : 'N/A';
      const merchant = receipt.processedData?.merchant || 'Unknown';
      const category = receipt.processedData?.category || 'N/A';
      const amount = receipt.processedData?.total
        ? `$${receipt.processedData.total.toFixed(2)}`
        : '$0.00';

      // Truncate long text
      const truncatedMerchant = merchant.length > 25 ? merchant.substring(0, 22) + '...' : merchant;
      const truncatedCategory = category.length > 15 ? category.substring(0, 12) + '...' : category;

      doc.text(date, margin, yPosition);
      doc.text(truncatedMerchant, margin + 35, yPosition);
      doc.text(truncatedCategory, margin + 95, yPosition);
      doc.text(amount, pageWidth - margin - 30, yPosition, { align: 'right' });

      yPosition += 7;
    });

    // Save PDF
    doc.save(`receipts_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },
};
