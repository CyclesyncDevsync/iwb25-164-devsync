import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PaymentMethod, PaymentMethodType } from '../../types/wallet';
import { PAYMENT_PROVIDERS } from '../../constants/wallet';

interface AddPaymentMethodModalProps {
  method?: PaymentMethod | null;
  onClose: () => void;
  onSave: (method: Partial<PaymentMethod>) => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  method,
  onClose,
  onSave,
}) => {
  type FormData = {
    type: PaymentMethodType;
    provider: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    branchCode: string;
    cardLastFour: string;
    cardBrand: string;
    expiryMonth: string | number;
    expiryYear: string | number;
    isDefault: boolean;
  };

  const [formData, setFormData] = useState<FormData>({
    type: method?.type || ('bank_account' as PaymentMethodType),
    provider: method?.provider || '',
    accountNumber: method?.accountNumber || '',
    accountName: method?.accountName || '',
    bankName: method?.bankName || '',
    branchCode: method?.branchCode || '',
    cardLastFour: method?.cardLastFour || '',
    cardBrand: method?.cardBrand || '',
    expiryMonth: method?.expiryMonth || '',
    expiryYear: method?.expiryYear || '',
    isDefault: method?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<keyof FormData | string, string>>({});

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value } as FormData));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.provider) {
      newErrors.provider = 'Provider is required';
    }

    if (!formData.accountName) {
      newErrors.accountName = 'Account name is required';
    }

    if (formData.type === 'bank_account') {
      if (!formData.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    if (formData.type === 'credit_card' || formData.type === 'debit_card') {
      if (!formData.cardLastFour || formData.cardLastFour.length !== 4) {
        newErrors.cardLastFour = 'Last 4 digits are required';
      }
      if (!formData.cardBrand) {
        newErrors.cardBrand = 'Card brand is required';
      }
      if (!formData.expiryMonth || !formData.expiryYear) {
        newErrors.expiry = 'Expiry date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const payload: Partial<PaymentMethod> = {
        type: formData.type,
        provider: formData.provider,
        accountNumber: formData.accountNumber || undefined,
        accountName: formData.accountName || undefined,
        bankName: formData.bankName || undefined,
        branchCode: formData.branchCode || undefined,
        cardLastFour: formData.cardLastFour || undefined,
        cardBrand: formData.cardBrand || undefined,
        expiryMonth: formData.expiryMonth ? Number(formData.expiryMonth) : undefined,
        expiryYear: formData.expiryYear ? Number(formData.expiryYear) : undefined,
        isDefault: formData.isDefault,
      };

      onSave(payload);
    }
  };

  const getProviderOptions = () => {
    switch (formData.type) {
      case 'bank_account':
        return PAYMENT_PROVIDERS.BANK_TRANSFERS;
      case 'digital_wallet':
        return PAYMENT_PROVIDERS.DIGITAL_WALLETS;
      case 'mobile_payment':
        return PAYMENT_PROVIDERS.MOBILE_PAYMENTS;
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {method ? 'Edit Payment Method' : 'Add Payment Method'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Payment Method Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as PaymentMethodType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bank_account">Bank Account</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="digital_wallet">Digital Wallet</option>
              <option value="mobile_payment">Mobile Payment</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            {getProviderOptions().length > 0 ? (
              <select
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a provider</option>
                {getProviderOptions().map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                placeholder="Enter provider name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
            {errors.provider && <p className="text-red-500 text-sm mt-1">{errors.provider}</p>}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              placeholder="Enter account holder name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.accountName && <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>}
          </div>

          {/* Bank Account Fields */}
          {formData.type === 'bank_account' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.branchCode}
                  onChange={(e) => handleInputChange('branchCode', e.target.value)}
                  placeholder="Enter branch code"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Card Fields */}
          {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  value={formData.cardLastFour}
                  onChange={(e) => handleInputChange('cardLastFour', e.target.value.slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.cardLastFour && <p className="text-red-500 text-sm mt-1">{errors.cardLastFour}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Brand
                </label>
                <select
                  value={formData.cardBrand}
                  onChange={(e) => handleInputChange('cardBrand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select card brand</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
                {errors.cardBrand && <p className="text-red-500 text-sm mt-1">{errors.cardBrand}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Month
                  </label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Year
                  </label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
            </>
          )}

          {/* Set as Default */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Set as default payment method
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {method ? 'Update' : 'Add'} Payment Method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;
