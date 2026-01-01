import React from 'react';
import type { Invoice } from '../../types/billing';
import { format } from 'date-fns';
import { Button } from '../common';
import { formatPriceDecimal } from '../../utils/priceUtils';

interface BillingHistoryProps {
  invoices: Invoice[];
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ invoices }) => {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No billing history</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have any invoices yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status: Invoice['status']) => {
    const statusStyles = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      void: 'bg-gray-100 text-gray-800',
      uncollectible: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Invoice
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {invoice.number}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {format(new Date(invoice.created), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {formatPriceDecimal(invoice.amountPaid)} {invoice.currency.toUpperCase()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  {invoice.invoicePdf && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(invoice.invoicePdf, '_blank')}
                    >
                      Download PDF
                    </Button>
                  )}
                  {!invoice.invoicePdf && invoice.hostedInvoiceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(invoice.hostedInvoiceUrl, '_blank')}
                    >
                      View
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
