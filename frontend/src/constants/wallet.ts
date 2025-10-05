import { WalletType, TransactionType, TransactionStatus, PaymentMethodType, EscrowStatus } from '../types/wallet';

// Wallet constants
export const WALLET_TYPES = {
  BUYER: 'buyer' as const,
  SUPPLIER: 'supplier' as const,
  ESCROW: 'escrow' as const,
  ADMIN: 'admin' as const,
};

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit' as const,
  WITHDRAWAL: 'withdrawal' as const,
  TRANSFER: 'transfer' as const,
  PAYMENT: 'payment' as const,
  REFUND: 'refund' as const,
  ESCROW_HOLD: 'escrow_hold' as const,
  ESCROW_RELEASE: 'escrow_release' as const,
  BID_FREEZE: 'bid_freeze' as const,
  BID_UNFREEZE: 'bid_unfreeze' as const,
  FEE: 'fee' as const,
  COMMISSION: 'commission' as const,
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending' as const,
  PROCESSING: 'processing' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  CANCELLED: 'cancelled' as const,
  REFUNDED: 'refunded' as const,
};

export const PAYMENT_METHOD_TYPES = {
  BANK_ACCOUNT: 'bank_account' as const,
  CREDIT_CARD: 'credit_card' as const,
  DEBIT_CARD: 'debit_card' as const,
  DIGITAL_WALLET: 'digital_wallet' as const,
  MOBILE_PAYMENT: 'mobile_payment' as const,
};

export const ESCROW_STATUS = {
  CREATED: 'created' as const,
  FUNDED: 'funded' as const,
  HELD: 'held' as const,
  RELEASED: 'released' as const,
  DISPUTED: 'disputed' as const,
  REFUNDED: 'refunded' as const,
  EXPIRED: 'expired' as const,
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  LKR: 'Rs.',
  EUR: '€',
  GBP: '£',
} as const;

export const SUPPORTED_CURRENCIES = ['LKR', 'USD'] as const;

export const TRANSACTION_LIMITS = {
  MIN_DEPOSIT: 100, // LKR
  MAX_DEPOSIT: 999999, // LKR (Stripe limit: 999,999.99 LKR)
  MIN_WITHDRAWAL: 500, // LKR
  MAX_WITHDRAWAL: 500000, // LKR
  DAILY_LIMIT: 999999, // LKR (Stripe limit per transaction)
  MONTHLY_LIMIT: 5000000, // LKR
};

export const ESCROW_CONFIG = {
  DEFAULT_HOLD_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  MAX_HOLD_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  AUTO_RELEASE_DELAY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export const PAYMENT_PROVIDERS = {
  BANK_TRANSFERS: ['Commercial Bank', 'Sampath Bank', 'HNB', 'BOC', 'NSB'],
  DIGITAL_WALLETS: ['PayPal', 'Wise', 'Skrill'],
  MOBILE_PAYMENTS: ['eZ Cash', 'mCash', 'Dialog Pay'],
} as const;

export const WALLET_ICONS = {
  [WalletType.BUYER]: 'ShoppingCartIcon',
  [WalletType.SUPPLIER]: 'TruckIcon',
  [WalletType.ESCROW]: 'ShieldCheckIcon',
  [WalletType.ADMIN]: 'CogIcon',
} as const;

export const TRANSACTION_ICONS = {
  [TransactionType.DEPOSIT]: 'ArrowDownIcon',
  [TransactionType.WITHDRAWAL]: 'ArrowUpIcon',
  [TransactionType.TRANSFER]: 'ArrowRightIcon',
  [TransactionType.PAYMENT]: 'CreditCardIcon',
  [TransactionType.REFUND]: 'ArrowUturnLeftIcon',
  [TransactionType.ESCROW_HOLD]: 'LockClosedIcon',
  [TransactionType.ESCROW_RELEASE]: 'LockOpenIcon',
  [TransactionType.BID_FREEZE]: 'PauseIcon',
  [TransactionType.BID_UNFREEZE]: 'PlayIcon',
  [TransactionType.FEE]: 'ReceiptPercentIcon',
  [TransactionType.COMMISSION]: 'BanknotesIcon',
} as const;

export const ANALYTICS_PERIODS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const;

export const WALLET_PERMISSIONS = {
  [WalletType.BUYER]: {
    canDeposit: true,
    canWithdraw: true,
    canTransfer: false,
    canViewAll: false,
    canManageEscrow: false,
  },
  [WalletType.SUPPLIER]: {
    canDeposit: false,
    canWithdraw: true,
    canTransfer: false,
    canViewAll: false,
    canManageEscrow: false,
  },
  [WalletType.ESCROW]: {
    canDeposit: false,
    canWithdraw: false,
    canTransfer: false,
    canViewAll: false,
    canManageEscrow: true,
  },
  [WalletType.ADMIN]: {
    canDeposit: true,
    canWithdraw: true,
    canTransfer: true,
    canViewAll: true,
    canManageEscrow: true,
  },
} as const;
