import React from 'react';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Wallet, WalletType, WALLET_THEMES } from '../../types/wallet';
import { CURRENCY_SYMBOLS } from '../../constants/wallet';

interface WalletCardProps {
  wallet: Wallet;
  isSelected?: boolean;
  showBalance?: boolean;
  onClick?: () => void;
  className?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  isSelected = false,
  showBalance = true,
  onClick,
  className = '',
}) => {
  const theme = WALLET_THEMES[wallet.type];
  
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case WalletType.BUYER:
        return CreditCardIcon;
      case WalletType.SUPPLIER:
        return BanknotesIcon;
      case WalletType.AGENT:
        return ShieldCheckIcon;
      case WalletType.ADMIN_SHARED:
        return UserGroupIcon;
      default:
        return CreditCardIcon;
    }
  };

  const getWalletLabel = (type: WalletType) => {
    switch (type) {
      case WalletType.BUYER:
        return 'Buyer Wallet';
      case WalletType.SUPPLIER:
        return 'Supplier Wallet';
      case WalletType.AGENT:
        return 'Agent Wallet';
      case WalletType.ADMIN_SHARED:
        return wallet.isShared ? 'Shared Admin Wallet' : 'Admin Wallet';
      default:
        return 'Wallet';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const Icon = getWalletIcon(wallet.type);

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg p-6 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
          : 'hover:shadow-md'
        }
        ${className}
      `}
      style={{
        backgroundColor: theme.background,
        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
        color: theme.text,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{getWalletLabel(wallet.type)}</h3>
            <p className="text-sm opacity-70">ID: {wallet.id.slice(-8)}</p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              wallet.isActive ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span className="text-xs font-medium">
            {wallet.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <div className="text-sm opacity-70 mb-1">Available Balance</div>
        <div className="text-2xl font-bold">
          {showBalance ? formatCurrency(wallet.balance, wallet.currency) : '••••••'}
        </div>
      </div>

      {/* Wallet Type Specific Info */}
      <div className="space-y-2">
        {wallet.type === WalletType.ADMIN_SHARED && wallet.isShared && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">Shared Wallet</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              All Admins
            </span>
          </div>
        )}

        {wallet.type === WalletType.SUPPLIER && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">Pending Earnings</span>
            <span className="font-medium">
              {showBalance ? formatCurrency(wallet.balance * 0.05, wallet.currency) : '••••'}
            </span>
          </div>
        )}

        {wallet.type === WalletType.AGENT && (
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">Commission</span>
            <span className="font-medium">
              {showBalance ? formatCurrency(wallet.balance * 0.03, wallet.currency) : '••••'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="opacity-70">Last Updated</span>
          <span className="font-medium">
            {new Date(wallet.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Gradient Overlay for Visual Enhancement */}
      <div
        className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        }}
      />
    </div>
  );
};

export default WalletCard;
