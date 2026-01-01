/**
 * Format price in cents to display string
 */
export const formatPrice = (priceInCents: number): string => {
  if (priceInCents === 0) return 'Free';
  return `$${(priceInCents / 100).toFixed(0)}`;
};

/**
 * Format price in cents to decimal string (e.g., for displaying $9.99)
 */
export const formatPriceDecimal = (priceInCents: number): string => {
  if (priceInCents === 0) return 'Free';
  return `$${(priceInCents / 100).toFixed(2)}`;
};

/**
 * Format receipt limit for display
 */
export const formatReceiptLimit = (limit: number): string => {
  if (limit === -1) return 'Unlimited';
  return limit.toString();
};
