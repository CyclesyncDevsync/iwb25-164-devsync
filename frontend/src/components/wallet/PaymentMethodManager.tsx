import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { PaymentMethod, PaymentMethodType } from '../../types/wallet';
import { RootState } from '../../store';
import { fetchPaymentMethods } from '../../store/slices/walletSlice';
import { AppDispatch } from '../../store';
import AddPaymentMethodModal from './AddPaymentMethodModal';

interface PaymentMethodManagerProps {
  className?: string;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { paymentMethods, loading } = useSelector((state: RootState) => state.wallet);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const getMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return CreditCardIcon;
      case 'bank_account':
        return BanknotesIcon;
      case 'digital_wallet':
      case 'mobile_payment':
        return DevicePhoneMobileIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getMethodLabel = (type: PaymentMethodType) => {
    switch (type) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'bank_account':
        return 'Bank Account';
      case 'digital_wallet':
        return 'Digital Wallet';
      case 'mobile_payment':
        return 'Mobile Payment';
      default:
        return 'Payment Method';
    }
  };

  const formatAccountInfo = (method: PaymentMethod) => {
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return `**** **** **** ${method.cardLastFour} • ${method.cardBrand}`;
      case 'bank_account':
        return `${method.bankName} • ****${method.accountNumber?.slice(-4)}`;
      case 'digital_wallet':
      case 'mobile_payment':
        return `${method.provider} • ${method.accountName}`;
      default:
        return method.provider;
    }
  };

  const handleSetDefault = async (methodId: string) => {
    // Mock API call - replace with actual implementation
    console.log('Setting default payment method:', methodId);
  };

  const handleDelete = async (methodId: string) => {
    // Mock API call - replace with actual implementation
    console.log('Deleting payment method:', methodId);
    setShowDeleteConfirm(null);
  };

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowAddModal(true);
  };

  if (loading.paymentMethods) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Methods
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your payment methods for deposits and withdrawals
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedMethod(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Method
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <CreditCardIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No payment methods
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add a payment method to start making transactions
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Method
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => {
            const Icon = getMethodIcon(method.type);
            
            return (
              <div
                key={method.id}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>

                {/* Method Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getMethodLabel(method.type)}
                    </p>
                    {method.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Default
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      {method.isVerified ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className={`text-xs ${
                        method.isVerified 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {method.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatAccountInfo(method)}
                  </p>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Added on {new Date(method.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(method.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Payment Method Modal */}
      {showAddModal && (
        <AddPaymentMethodModal
          method={selectedMethod}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMethod(null);
          }}
          onSave={(method) => {
            console.log('Saving payment method:', method);
            setShowAddModal(false);
            setSelectedMethod(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Payment Method
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;
