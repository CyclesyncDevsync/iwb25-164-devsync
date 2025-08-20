import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  Wallet,
  Transaction,
  PaymentMethod,
  EscrowTransaction,
  FinancialAnalytics,
  WalletFilters,
  TransactionFilters,
  WalletType,
  TransactionType,
  TransactionStatus,
} from '../../types/wallet';

interface WalletState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  escrowTransactions: EscrowTransaction[];
  analytics: FinancialAnalytics | null;
  filters: {
    wallet: WalletFilters;
    transaction: TransactionFilters;
  };
  loading: {
    wallets: boolean;
    transactions: boolean;
    paymentMethods: boolean;
    analytics: boolean;
    escrow: boolean;
  };
  error: string | null;
}

const initialState: WalletState = {
  wallets: [],
  currentWallet: null,
  transactions: [],
  paymentMethods: [],
  escrowTransactions: [],
  analytics: null,
  filters: {
    wallet: {},
    transaction: {},
  },
  loading: {
    wallets: false,
    transactions: false,
    paymentMethods: false,
    analytics: false,
    escrow: false,
  },
  error: null,
};

// Async thunks
export const fetchWallets = createAsyncThunk(
  'wallet/fetchWallets',
  async (filters?: WalletFilters) => {
    // Mock API call - replace with actual API
    return new Promise<Wallet[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            userId: 'user1',
            type: WalletType.BUYER,
            balance: 25000,
            currency: 'LKR',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: 'user1',
            type: WalletType.ESCROW,
            balance: 5000,
            currency: 'LKR',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }, 1000);
    });
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (filters?: TransactionFilters) => {
    // Mock API call - replace with actual API
    return new Promise<Transaction[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            walletId: '1',
            type: TransactionType.DEPOSIT,
            amount: 10000,
            currency: 'LKR',
            status: TransactionStatus.COMPLETED,
            description: 'Wallet top-up',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            walletId: '1',
            type: TransactionType.BID_FREEZE,
            amount: 5000,
            currency: 'LKR',
            status: TransactionStatus.COMPLETED,
            description: 'Bid on Plastic Bottles Auction',
            reference: 'auction_123',
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            updatedAt: new Date(Date.now() - 43200000).toISOString(),
          },
        ]);
      }, 1000);
    });
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'wallet/fetchPaymentMethods',
  async () => {
    // Mock API call - replace with actual API
    return new Promise<PaymentMethod[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            userId: 'user1',
            type: 'bank_account' as any,
            provider: 'Commercial Bank',
            accountNumber: '****1234',
            accountName: 'John Doe',
            bankName: 'Commercial Bank of Ceylon',
            branchCode: '001',
            isDefault: true,
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }, 1000);
    });
  }
);

export const fetchAnalytics = createAsyncThunk(
  'wallet/fetchAnalytics',
  async (period: 'day' | 'week' | 'month' | 'quarter' | 'year') => {
    // Mock API call - replace with actual API
    return new Promise<FinancialAnalytics>((resolve) => {
      setTimeout(() => {
        resolve({
          period,
          totalRevenue: 150000,
          totalTransactions: 85,
          averageTransactionValue: 1764,
          transactionsByType: {
            [TransactionType.DEPOSIT]: 25,
            [TransactionType.WITHDRAWAL]: 15,
            [TransactionType.TRANSFER]: 10,
            [TransactionType.PAYMENT]: 20,
            [TransactionType.REFUND]: 5,
            [TransactionType.ESCROW_HOLD]: 5,
            [TransactionType.ESCROW_RELEASE]: 3,
            [TransactionType.BID_FREEZE]: 2,
            [TransactionType.BID_UNFREEZE]: 0,
            [TransactionType.FEE]: 0,
            [TransactionType.COMMISSION]: 0,
          },
          transactionsByStatus: {
            [TransactionStatus.PENDING]: 5,
            [TransactionStatus.PROCESSING]: 2,
            [TransactionStatus.COMPLETED]: 75,
            [TransactionStatus.FAILED]: 2,
            [TransactionStatus.CANCELLED]: 1,
            [TransactionStatus.REFUNDED]: 0,
          },
          revenueByPeriod: [
            { period: '2024-01', revenue: 45000, transactions: 25 },
            { period: '2024-02', revenue: 52000, transactions: 30 },
            { period: '2024-03', revenue: 53000, transactions: 30 },
          ],
          topPaymentMethods: [
            { type: 'bank_account' as any, usage: 60, volume: 120000 },
            { type: 'digital_wallet' as any, usage: 25, volume: 25000 },
            { type: 'mobile_payment' as any, usage: 15, volume: 5000 },
          ],
          escrowMetrics: {
            totalHeld: 45000,
            totalReleased: 35000,
            averageHoldTime: 5.2,
            disputeRate: 0.02,
          },
        });
      }, 1000);
    });
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setCurrentWallet: (state, action: PayloadAction<Wallet | null>) => {
      state.currentWallet = action.payload;
    },
    setWalletFilters: (state, action: PayloadAction<WalletFilters>) => {
      state.filters.wallet = action.payload;
    },
    setTransactionFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters.transaction = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    updateWalletBalance: (state, action: PayloadAction<{ walletId: string; amount: number }>) => {
      const wallet = state.wallets.find(w => w.id === action.payload.walletId);
      if (wallet) {
        wallet.balance = action.payload.amount;
        wallet.updatedAt = new Date().toISOString();
      }
      if (state.currentWallet?.id === action.payload.walletId) {
        state.currentWallet.balance = action.payload.amount;
        state.currentWallet.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch wallets
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.loading.wallets = true;
        state.error = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.loading.wallets = false;
        state.wallets = action.payload;
        if (!state.currentWallet && action.payload.length > 0) {
          state.currentWallet = action.payload[0];
        }
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.loading.wallets = false;
        state.error = action.error.message || 'Failed to fetch wallets';
      });

    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });

    // Fetch payment methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading.paymentMethods = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading.paymentMethods = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading.paymentMethods = false;
        state.error = action.error.message || 'Failed to fetch payment methods';
      });

    // Fetch analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      });
  },
});

export const {
  setCurrentWallet,
  setWalletFilters,
  setTransactionFilters,
  clearError,
  addTransaction,
  updateTransaction,
  updateWalletBalance,
} = walletSlice.actions;

export default walletSlice.reducer;
