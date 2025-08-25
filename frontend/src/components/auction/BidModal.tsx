import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Gavel, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Zap,
  Settings,
  Info
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { 
  setShowBidModal, 
  setShowAutoBidModal,
  placeBid,
  clearErrors
} from '@/store/slices/auctionSlice';
import { useAuctionWebSocket } from '@/services/auctionWebSocket';
import { formatCurrency, formatTimeRemaining } from '@/utils/formatters';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    selectedAuctionId, 
    currentAuction, 
    realTimeData, 
    loading, 
    error,
    autoBidSettings 
  } = useSelector((state: RootState) => state.auctions);
  
  const webSocket = useAuctionWebSocket();
  
  const [bidAmount, setBidAmount] = useState<string>('');
  const [maxBidAmount, setMaxBidAmount] = useState<string>('');
  const [enableAutoBid, setEnableAutoBid] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  // Get auction data
  const auction = currentAuction || (selectedAuctionId ? { id: selectedAuctionId } : null);
  const realtimeData = auction ? realTimeData[auction.id] : null;
  const currentPrice = realtimeData?.currentPrice || currentAuction?.currentPrice || 0;
  const incrementAmount = currentAuction?.incrementAmount || 10;
  const timeRemaining = realtimeData?.timeRemaining || 0;
  const autoBid = auction ? autoBidSettings[auction.id] : null;

  // Calculate suggested bid amounts
  const minBidAmount = currentPrice + incrementAmount;
  const suggestedBids = [
    minBidAmount,
    minBidAmount + incrementAmount,
    minBidAmount + incrementAmount * 2,
    minBidAmount + incrementAmount * 5,
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBidAmount(minBidAmount.toString());
      setMaxBidAmount('');
      setEnableAutoBid(autoBid?.enabled || false);
      setBidError(null);
      dispatch(clearErrors());
    }
  }, [isOpen, minBidAmount, autoBid, dispatch]);

  // Validate bid amount
  const validateBid = useCallback((amount: number): string | null => {
    if (amount < minBidAmount) {
      return `Minimum bid is ${formatCurrency(minBidAmount)}`;
    }
    
    if (maxBidAmount && amount > parseFloat(maxBidAmount)) {
      return `Bid cannot exceed maximum bid of ${formatCurrency(parseFloat(maxBidAmount))}`;
    }
    
    return null;
  }, [minBidAmount, maxBidAmount]);

  // Handle bid amount change
  const handleBidAmountChange = (value: string) => {
    setBidAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount)) {
      setBidError(validateBid(amount));
    }
  };

  // Handle quick bid buttons
  const handleQuickBid = (amount: number) => {
    setBidAmount(amount.toString());
    setBidError(validateBid(amount));
  };

  // Submit bid
  const handleSubmitBid = async () => {
    if (!auction) return;
    
    const amount = parseFloat(bidAmount);
    const maxAmount = maxBidAmount ? parseFloat(maxBidAmount) : undefined;
    
    const validationError = validateBid(amount);
    if (validationError) {
      setBidError(validationError);
      return;
    }
    
    try {
      await dispatch(placeBid({
        auctionId: auction.id,
        amount,
        maxAmount: enableAutoBid ? maxAmount : undefined,
      })).unwrap();
      
      onClose();
    } catch (err) {
      setBidError(err as string);
    }
  };

  // Handle auto-bid settings
  const handleAutoBidSettings = () => {
    dispatch(setShowAutoBidModal(true));
  };

  if (!auction) return null;

  const isExpiringSoon = timeRemaining > 0 && timeRemaining <= 300000; // 5 minutes

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Gavel className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Place Your Bid
                    </h3>
                    <p className="text-sm text-gray-500">
                      {currentAuction?.title || 'Auction Item'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current auction info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Current Price</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                
                {timeRemaining > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Remaining</span>
                    <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                )}
                
                {isExpiringSoon && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Auction ending soon! Place your bid quickly.
                    </span>
                  </div>
                )}
              </div>

              {/* Quick bid buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Bid Options
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedBids.map((amount, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickBid(amount)}
                      className={`
                        p-3 text-center border rounded-lg transition-colors duration-200
                        ${bidAmount === amount.toString()
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      <div className="font-medium">{formatCurrency(amount)}</div>
                      {index === 0 && (
                        <div className="text-xs text-gray-500">Minimum</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom bid amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Bid Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => handleBidAmountChange(e.target.value)}
                    min={minBidAmount}
                    step={incrementAmount}
                    className={`
                      w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${bidError ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder={`Minimum ${formatCurrency(minBidAmount)}`}
                  />
                </div>
                {bidError && (
                  <p className="mt-2 text-sm text-red-600">{bidError}</p>
                )}
              </div>

              {/* Advanced options toggle */}
              <div className="mb-4">
                <button
                  onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Bidding Options</span>
                </button>
              </div>

              {/* Advanced options */}
              <AnimatePresence>
                {isAdvancedMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 p-4 border border-gray-200 rounded-lg"
                  >
                    {/* Auto-bid toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">Enable Auto-Bid</span>
                      </div>
                      <button
                        onClick={() => setEnableAutoBid(!enableAutoBid)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                          ${enableAutoBid ? 'bg-blue-600' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                            ${enableAutoBid ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>

                    {/* Max bid amount for auto-bid */}
                    {enableAutoBid && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Auto-Bid Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={maxBidAmount}
                            onChange={(e) => setMaxBidAmount(e.target.value)}
                            min={parseFloat(bidAmount) || minBidAmount}
                            step={incrementAmount}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter maximum amount"
                          />
                        </div>
                        <div className="mt-2 flex items-start space-x-2 text-xs text-gray-500">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Auto-bid will automatically place incremental bids up to this amount when you're outbid.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Auto-bid settings button */}
                    {autoBid && (
                      <button
                        onClick={handleAutoBidSettings}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Configure Auto-Bid Settings
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error display */}
              {error.placingBid && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error.placingBid}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSubmitBid}
                  disabled={loading.placingBid || !!bidError || !bidAmount}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {loading.placingBid ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Placing Bid...</span>
                    </>
                  ) : (
                    <>
                      <Gavel className="w-4 h-4" />
                      <span>Place Bid {bidAmount && `- ${formatCurrency(parseFloat(bidAmount))}`}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BidModal;
