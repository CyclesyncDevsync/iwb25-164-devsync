import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { PaymentMethod, Wallet } from '../../types/wallet';
import { CURRENCY_SYMBOLS, TRANSACTION_LIMITS } from '../../constants/wallet';

interface DepositModalProps {
  wallet: Wallet;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
  onDeposit: (data: { amount: number; paymentMethodId: string; note?: string }) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({
  wallet,
  paymentMethods,
  onClose,
  onDeposit,
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
    } else if (amountNum < TRANSACTION_LIMITS.MIN_DEPOSIT) {
      newErrors.amount = `Minimum deposit is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MIN_DEPOSIT}`;
    } else if (amountNum > TRANSACTION_LIMITS.MAX_DEPOSIT) {
      newErrors.amount = `Maximum deposit is ${CURRENCY_SYMBOLS.LKR} ${TRANSACTION_LIMITS.MAX_DEPOSIT}`;
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
      await onDeposit({
        amount: parseFloat(amount),
        paymentMethodId: selectedPaymentMethod,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '' : `${CURRENCY_SYMBOLS.LKR} ${num.toLocaleString()}`;
  };

  const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                Current Balance: {formatCurrency(wallet.balance.toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount to Deposit
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
                min={TRANSACTION_LIMITS.MIN_DEPOSIT}
                max={TRANSACTION_LIMITS.MAX_DEPOSIT}
                step="0.01"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            
            {/* Limits Info */}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Minimum: {formatCurrency(TRANSACTION_LIMITS.MIN_DEPOSIT.toString())} • 
              Maximum: {formatCurrency(TRANSACTION_LIMITS.MAX_DEPOSIT.toString())}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>No payment methods available</p>
                  <p className="text-sm">Add a payment method first</p>
                </div>
              ) : (
                paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
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
                      <CreditCardIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {method.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {method.provider} • 
                          {method.accountNumber ? ` ****${method.accountNumber.slice(-4)}` : method.accountName}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
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
              placeholder="Add a note for this deposit..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {amount && selectedMethod && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transaction Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deposit Amount:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                  <span className="font-medium">{CURRENCY_SYMBOLS.LKR} 0.00</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total to be charged:</span>
                    <span>{formatCurrency(amount)}</span>
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
              disabled={isProcessing || !amount || !selectedPaymentMethod}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Deposit Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
