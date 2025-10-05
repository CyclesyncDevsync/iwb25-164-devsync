// Stripe configuration and utilities (compatible with React 19)

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'LKR'): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to convert amount to cents for Stripe
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to convert cents to amount
export const fromCents = (cents: number): number => {
  return cents / 100;
};

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'lkr',
  country: 'LK',
  locale: 'en-LK',
} as const;