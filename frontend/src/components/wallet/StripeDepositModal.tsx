import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, BanknotesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Wallet } from '../../types/wallet';
import { CURRENCY_SYMBOLS, TRANSACTION_LIMITS } from '../../constants/wallet';
import { paymentService, PaymentIntent } from '../../services/paymentService';
import { toast } from 'react-hot-toast';

interface StripeDepositModalProps {
  wallet: Wallet;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

const StripeDepositModal: React.FC<StripeDepositModalProps> = ({
  wallet,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [stripe, setStripe] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Stripe.js dynamically
    const loadStripe = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        console.error('Stripe publishable key is not set');
        return;
      }

      if (window.Stripe) {
        const stripeInstance = window.Stripe(publishableKey);
        setStripe(stripeInstance);
      } else {
        // Load Stripe.js script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => {
          if (window.Stripe) {
            const stripeInstance = window.Stripe(publishableKey);
            setStripe(stripeInstance);
          }
        };
        document.head.appendChild(script);
      }
    };

    loadStripe();
  }, []);

  useEffect(() => {
    if (stripe && step === 'payment' && !cardElement) {
      // Create card element
      const elements = stripe.elements();
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });
      
      card.mount('#card-element');
      setCardElement(card);

      // Handle real-time validation errors from the card Element
      card.on('change', ({ error }: any) => {
        setErrors(prev => ({
          ...prev,
          card: error ? error.message : ''
        }));
      });
    }
  }, [stripe, step, cardElement]);

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

    setIsLoading(true);
    try {
      const paymentIntentData = await paymentService.createPaymentIntent({
        amount: parseFloat(amount),
        currency: 'lkr',
        description: note.trim() || `Wallet recharge - ${wallet.type} wallet`,
        customer: {
          name: 'User', // You might want to get this from user context
          email: 'user@example.com', // You might want to get this from user context
        }
      });

      setPaymentIntent(paymentIntentData);
      setStep('payment');
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      toast.error(error.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !cardElement || !paymentIntent) {
      return;
    }

    setIsProcessing(true);
    setErrors(prev => ({ ...prev, payment: '' }));

    try {
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'User', // You might want to get this from user context
            },
          },
        }
      );

      if (error) {
        setErrors(prev => ({ ...prev, payment: error.message }));
        setIsProcessing(false);
        return;
      }

      if (confirmedPaymentIntent && confirmedPaymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await paymentService.confirmPayment({
          payment_intent_id: confirmedPaymentIntent.id,
          amount: parseFloat(amount),
          currency: 'lkr',
          description: note.trim() || `Wallet recharge - ${wallet.type} wallet`,
        });

        toast.success('Payment successful! Your wallet has been recharged.');
        onSuccess();
        onClose();
      } else {
        setErrors(prev => ({ ...prev, payment: 'Payment was not completed successfully' }));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrors(prev => ({ ...prev, payment: error.message || 'An unexpected error occurred' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setStep('amount');
    setPaymentIntent(null);
    if (cardElement) {
      cardElement.destroy();
      setCardElement(null);
    }
  };

  const formatCurrencyDisplay = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '' : formatCurrency(num);
  };

  const renderAmountStep = () => (
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
          {isLoading ? 'Creating Payment...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );

  const renderPaymentStep = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CreditCardIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Payment Amount</p>
              <p className="font-medium text-green-900 dark:text-green-100">
                {formatCurrency(parseFloat(amount))}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit Amount
          </button>
        </div>
      </div>

      {/* Card Input */}
      <div className="px-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="h-5 w-5 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Payment Details
            </h4>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div id="card-element" className="min-h-[40px]">
              {/* Stripe Elements will mount here */}
            </div>
          </div>
          
          {errors.card && (
            <p className="text-sm text-red-600">{errors.card}</p>
          )}
        </div>

        {/* Error Display */}
        {errors.payment && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Payment Error
                </h5>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {errors.payment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🔒 Your payment information is secure and encrypted. We use Stripe for payment processing.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-between space-x-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Back
        </button>
        
        <button
          type="submit"
          disabled={!stripe || !cardElement || isProcessing}
          className={`px-6 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !stripe || !cardElement || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Pay ${formatCurrency(parseFloat(amount))}`
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 'amount' ? 'Deposit Funds' : 'Complete Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {step === 'amount' ? renderAmountStep() : renderPaymentStep()}
      </div>
    </div>
  );
};

export default StripeDepositModal;