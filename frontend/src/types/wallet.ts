export interface Wallet {
  id: string;
  userId: string | null; // null for shared admin wallet
  type: WalletType;
  balance: number;
  currency: string;
  isActive: boolean;
  isShared?: boolean; // true for shared admin wallet
  createdAt: string;
  updatedAt: string;
}

export enum WalletType {
  BUYER = 'buyer',
  SUPPLIER = 'supplier',
  AGENT = 'agent',
  ADMIN_SHARED = 'admin_shared', // Shared wallet for all admins and super_admins
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  reference?: string;
  fromWallet?: string;
  toWallet?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  ESCROW_HOLD = 'escrow_hold',
  ESCROW_RELEASE = 'escrow_release',
  BID_FREEZE = 'bid_freeze',
  BID_UNFREEZE = 'bid_unfreeze',
  FEE = 'fee',
  COMMISSION = 'commission',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  branchCode?: string;
  cardLastFour?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethodType {
  BANK_ACCOUNT = 'bank_account',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  MOBILE_PAYMENT = 'mobile_payment',
}

export interface EscrowTransaction {
  id: string;
  auctionId: string;
  buyerId: string;
  supplierId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  holdExpiresAt: string;
  releaseConditions: string[];
  disputeId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  HELD = 'held',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export interface FinancialAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  transactionsByType: Record<TransactionType, number>;
  transactionsByStatus: Record<TransactionStatus, number>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
  }>;
  topPaymentMethods: Array<{
    type: PaymentMethodType;
    usage: number;
    volume: number;
  }>;
  escrowMetrics: {
    totalHeld: number;
    totalReleased: number;
    averageHoldTime: number;
    disputeRate: number;
  };
}

export interface WalletFilters {
  type?: WalletType;
  status?: 'active' | 'inactive';
  balanceMin?: number;
  balanceMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  walletId?: string;
  reference?: string;
}

export interface WalletTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export const WALLET_THEMES: Record<WalletType, WalletTheme> = {
  [WalletType.BUYER]: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    background: '#EFF6FF',
    text: '#1E3A8A',
    border: '#93C5FD',
  },
  [WalletType.SUPPLIER]: {
    primary: '#10B981',
    secondary: '#047857',
    accent: '#34D399',
    background: '#ECFDF5',
    text: '#065F46',
    border: '#6EE7B7',
  },
  [WalletType.AGENT]: {
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FCD34D',
    background: '#FFFBEB',
    text: '#92400E',
    border: '#FDE68A',
  },
  [WalletType.ADMIN_SHARED]: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#A78BFA',
    background: '#F5F3FF',
    text: '#5B21B6',
    border: '#C4B5FD',
  },
};
