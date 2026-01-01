export interface Invoice {
  id: string;
  number: string;
  amountPaid: number; // in cents
  amountDue: number; // in cents
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: Date;
  periodStart: Date;
  periodEnd: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  description?: string;
}

export interface BillingHistory {
  invoices: Invoice[];
  hasMore: boolean;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: string;
}
