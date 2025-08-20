import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Wallet, WalletType, WALLET_THEMES } from '../../types/wallet';
import { WALLET_PERMISSIONS } from '../../constants/wallet';
import { RootState } from '../../store';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

interface QuickActionsProps {
  wallet: Wallet;
  onAction: (action: string, data?: any) => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  wallet,
  onAction,
  className = '',
}) => {
  const { paymentMethods } = useSelector((state: RootState) => state.wallet);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const theme = WALLET_THEMES[wallet.type];
  const permissions = WALLET_PERMISSIONS[wallet.type];

  const actions = [
    {
      id: 'deposit',
      label: 'Deposit',
      icon: ArrowDownIcon,
      color: 'bg-green-500 hover:bg-green-600',
      available: permissions.canDeposit,
      disabled: !wallet.isActive,
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: ArrowUpIcon,
      color: 'bg-red-500 hover:bg-red-600',
      available: permissions.canWithdraw,
      disabled: !wallet.isActive || wallet.balance <= 0,
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: ArrowRightIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      available: permissions.canTransfer,
      disabled: !wallet.isActive || wallet.balance <= 0,
    },
    {
      id: 'freeze',
      label: 'Freeze Funds',
      icon: LockClosedIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      available: wallet.type === WalletType.BUYER,
      disabled: !wallet.isActive || wallet.balance <= 0,
    },
    {
      id: 'escrow',
      label: 'Escrow',
      icon: ShieldCheckIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: permissions.canManageEscrow,
      disabled: !wallet.isActive,
    },
  ];

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'deposit':
        setShowDepositModal(true);
        break;
      case 'withdraw':
        setShowWithdrawModal(true);
        break;
      case 'transfer':
        setShowTransferModal(true);
        break;
      default:
        onAction(actionId);
    }
  };

  const handleDeposit = async (data: { amount: number; paymentMethodId: string; note?: string }) => {
    console.log('Deposit:', data);
    // Here you would dispatch the actual deposit action
    onAction('deposit', data);
  };

  const handleWithdraw = async (data: { amount: number; paymentMethodId: string; note?: string }) => {
    console.log('Withdraw:', data);
    // Here you would dispatch the actual withdraw action
    onAction('withdraw', data);
  };

  return (
    <div className={`${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions
            .filter(action => action.available)
            .map((action) => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  disabled={action.disabled}
                  className={`
                    flex flex-col items-center p-4 rounded-lg text-white transition-all duration-200
                    ${action.disabled 
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50' 
                      : `${action.color} hover:shadow-lg hover:scale-105 active:scale-95`
                    }
                  `}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
        </div>

        {/* Wallet-specific tips */}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: theme.background }}>
          <div className="flex items-start space-x-2">
            <div 
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: theme.primary }}
            />
            <div className="text-sm" style={{ color: theme.text }}>
              {wallet.type === WalletType.BUYER && (
                <>
                  <strong>Buyer Wallet:</strong> Use this wallet to participate in auctions and make purchases. 
                  Funds may be temporarily frozen during bidding.
                </>
              )}
              {wallet.type === WalletType.SUPPLIER && (
                <>
                  <strong>Supplier Wallet:</strong> Receive payments from successful auctions here. 
                  Withdrawals are available once materials are delivered.
                </>
              )}
              {wallet.type === WalletType.ESCROW && (
                <>
                  <strong>Escrow Wallet:</strong> Funds held in escrow for ongoing transactions. 
                  Automatic release upon successful completion.
                </>
              )}
              {wallet.type === WalletType.ADMIN && (
                <>
                  <strong>Admin Wallet:</strong> Platform administration funds. 
                  Used for fees, commissions, and refunds.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          wallet={wallet}
          paymentMethods={paymentMethods}
          onClose={() => setShowDepositModal(false)}
          onDeposit={handleDeposit}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          wallet={wallet}
          paymentMethods={paymentMethods}
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* Transfer Modal - Placeholder */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transfer Funds
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transfer modal would be implemented here with wallet selection and amount input.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
