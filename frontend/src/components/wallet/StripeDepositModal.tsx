import React, { useState } from 'react';
import { XMarkIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { Wallet } from '../../types/wallet';
import { CURRENCY_SYMBOLS, TRANSACTION_LIMITS } from '../../constants/wallet';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';

interface StripeDepositModalProps {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
  initialAmount?: string;
  initialNote?: string;
}

const StripeDepositModal: React.FC<StripeDepositModalProps> = ({
  wallet,
  onClose,
  onSuccess,
  initialAmount = '',
  initialNote = '',
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState(initialNote);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amountNum < TRANSACTION_LIMITS.MIN_DEPOSIT) {
      newErrors.amount = `Minimum deposit is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MIN_DEPOSIT}`;
    } else if (amountNum > TRANSACTION_LIMITS.MAX_DEPOSIT) {
      newErrors.amount = `Maximum deposit is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MAX_DEPOSIT}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Create checkout session and redirect to Stripe
    setIsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const session = await paymentService.createCheckoutSession({
        amount: parseFloat(amount),
        currency: 'lkr',
        successUrl: `${baseUrl}/buyer/wallet?payment=success`,
        cancelUrl: `${baseUrl}/buyer/wallet?payment=cancelled`,
      });

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      toast.error(error.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  const formatCurrencyDisplay = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '' : formatCurrency(num);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deposit Funds
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleAmountSubmit} className="space-y-6">
          {/* Wallet Info */}
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Depositing to</p>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Current Balance: {formatCurrency(wallet.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="px-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount to Deposit *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{CURRENCY_SYMBOLS.LKR}</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min={TRANSACTION_LIMITS.MIN_DEPOSIT}
                max={TRANSACTION_LIMITS.MAX_DEPOSIT}
                className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.amount
                    ? 'border-red-300 text-red-900 placeholder-red-300'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                }`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
            {amount && !errors.amount && (
              <p className="mt-1 text-sm text-green-600">
                You will deposit {formatCurrencyDisplay(amount)}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Min: {formatCurrency(TRANSACTION_LIMITS.MIN_DEPOSIT)} | Max: {formatCurrency(TRANSACTION_LIMITS.MAX_DEPOSIT)}
            </p>
          </div>

          {/* Note Input */}
          <div className="px-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={255}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              placeholder="Add a note for this transaction..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {note.length}/255 characters
            </p>
          </div>

          {/* Security Notice */}
          <div className="px-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                🔒 You will be redirected to Stripe's secure payment page to complete your transaction.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount || !!errors.amount}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || !amount || !!errors.amount
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Redirecting...' : 'Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripeDepositModal;