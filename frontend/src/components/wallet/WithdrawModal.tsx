import React, { useState } from 'react';
import { XMarkIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PaymentMethod, Wallet } from '../../types/wallet';
import { CURRENCY_SYMBOLS, TRANSACTION_LIMITS } from '../../constants/wallet';

interface WithdrawModalProps {
  wallet: Wallet;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onWithdraw: (data: { amount: number; paymentMethodId: string; note?: string }) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  wallet,
  paymentMethods,
  onClose,
  onWithdraw,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (amountNum < TRANSACTION_LIMITS.MIN_WITHDRAWAL) {
      newErrors.amount = `Minimum withdrawal is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MIN_WITHDRAWAL}`;
    } else if (amountNum > TRANSACTION_LIMITS.MAX_WITHDRAWAL) {
      newErrors.amount = `Maximum withdrawal is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MAX_WITHDRAWAL}`;
    } else if (amountNum > wallet.balance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await onWithdraw({
        amount: parseFloat(amount),
        paymentMethodId: selectedPaymentMethod,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '' : `${CURRENCY_SYMBOLS.LKR} ${num.toLocaleString()}`;
  };

  const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  const withdrawalFee = parseFloat(amount) * 0.01; // 1% withdrawal fee
  const netAmount = parseFloat(amount) - withdrawalFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Withdraw Funds
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Wallet Info */}
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <BanknotesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Withdrawing from</p>
              <p className="font-medium text-red-900 dark:text-red-100">
                {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Available Balance: {formatCurrency(wallet.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Important Information:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Withdrawals are processed within 1-3 business days</li>
                <li>A 1% processing fee applies to all withdrawals</li>
                <li>Minimum withdrawal amount is {formatCurrency(TRANSACTION_LIMITS.MIN_WITHDRAWAL)}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount to Withdraw
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {CURRENCY_SYMBOLS.LKR}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={TRANSACTION_LIMITS.MIN_WITHDRAWAL}
                max={Math.min(TRANSACTION_LIMITS.MAX_WITHDRAWAL, wallet.balance)}
                step="0.01"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            
            {/* Quick Amount Buttons */}
            <div className="mt-2 flex space-x-2">
              {[0.25, 0.5, 0.75, 1].map((percentage) => {
                const quickAmount = wallet.balance * percentage;
                if (quickAmount >= TRANSACTION_LIMITS.MIN_WITHDRAWAL) {
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setAmount(quickAmount.toFixed(2))}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {percentage === 1 ? 'Max' : `${percentage * 100}%`}
                    </button>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Limits Info */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Available: {formatCurrency(wallet.balance)} • 
              Maximum: {formatCurrency(Math.min(TRANSACTION_LIMITS.MAX_WITHDRAWAL, wallet.balance))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Withdraw to Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.filter(method => method.type === 'bank_account').length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>No bank accounts available</p>
                  <p className="text-sm">Add a bank account for withdrawals</p>
                </div>
              ) : (
                paymentMethods
                  .filter(method => method.type === 'bank_account')
                  .map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <BanknotesIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {method.bankName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {method.accountName} • ****{method.accountNumber?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </label>
                  ))
              )}
            </div>
            {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this withdrawal..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {amount && selectedMethod && !isNaN(parseFloat(amount)) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Withdrawal Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Withdrawal Amount:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee (1%):</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(withdrawalFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>You will receive:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatCurrency(netAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !amount || !selectedPaymentMethod || parseFloat(amount) > wallet.balance}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Withdraw Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
