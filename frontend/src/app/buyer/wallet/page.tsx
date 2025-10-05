"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  WalletIcon,
  ArrowPathIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import StripeDepositModal from "@/components/wallet/StripeDepositModal";
import { toast } from "react-hot-toast";
import { WalletType } from "@/types/wallet";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

interface WalletData {
  available_balance: number;
  frozen_balance: number;
  total_balance: number;
}

interface WalletModal {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  available_balance: number;
  frozen_balance: number;
  total_balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WalletPage() {
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [walletForModal, setWalletForModal] = useState<WalletModal | null>(
    null
  );
  const hasProcessedPayment = useRef(false);

  useEffect(() => {
    // Check for payment status in URL
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (
      paymentStatus === "success" &&
      sessionId &&
      !hasProcessedPayment.current
    ) {
      // Verify the checkout session with backend
      hasProcessedPayment.current = true;
      verifyCheckoutSession(sessionId);
    } else if (paymentStatus === "cancelled" && !hasProcessedPayment.current) {
      hasProcessedPayment.current = true;
      toast.error("Payment was cancelled.", {
        duration: 4000,
        icon: "❌",
      });
      // Remove query param from URL without refresh
      window.history.replaceState({}, "", "/buyer/wallet");
      fetchWalletData();
    } else if (!paymentStatus) {
      // Initial fetch if no payment status
      fetchWalletData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();

      // Fetch balance and transactions in parallel for better performance
      const [balanceResponse, txResponse] = await Promise.all([
        fetch("/api/wallet/balance", { credentials: "include" }),
        fetch("/api/wallet/transactions?limit=20", { credentials: "include" }),
      ]);

      // Process balance data
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.status === "success" && balanceData.data) {
          setBalance(balanceData.data);
          // Create wallet object for modal
          setWalletForModal({
            id: String(balanceData.data.id || 1),
            userId: String(balanceData.data.user_id || 1),
            type: WalletType.BUYER, // Set wallet type for buyer
            balance: balanceData.data.available_balance || 0,
            available_balance: balanceData.data.available_balance,
            frozen_balance: balanceData.data.frozen_balance,
            total_balance: balanceData.data.total_balance,
            currency: "LKR",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Process transaction data
      if (txResponse.ok) {
        const txData = await txResponse.json();
        if (txData.status === "success" && txData.data) {
          setTransactions(txData.data);
        }
      }

      const endTime = performance.now();
      console.log(
        `✅ Wallet data loaded in ${(endTime - startTime).toFixed(2)}ms`
      );
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const verifyCheckoutSession = React.useCallback(async (sessionId: string) => {
    try {
      const response = await fetch("/api/payment/verify-checkout-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Show success message with amount if available
        const message = data.data?.amount
          ? `Payment successful! LKR ${(data.data.amount / 100).toFixed(
              2
            )} added to your wallet.`
          : "Payment successful! Your wallet has been recharged.";

        toast.success(message, {
          duration: 5000,
          icon: "✅",
        });
        // Remove query params from URL
        window.history.replaceState({}, "", "/buyer/wallet");
        // Refresh wallet data
        fetchWalletData();
      } else {
        toast.error(
          "Failed to verify payment. Please contact support if amount was deducted."
        );
        window.history.replaceState({}, "", "/buyer/wallet");
      }
    } catch (error) {
      console.error("Failed to verify checkout session:", error);
      toast.error(
        "Failed to verify payment. Please contact support if amount was deducted."
      );
      window.history.replaceState({}, "", "/buyer/wallet");
    }
  }, []);

  const handleDepositSuccess = () => {
    setShowDepositModal(false);
    fetchWalletData();
    toast.success("Payment initiated successfully!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "completed") {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else if (status === "failed" || status === "cancelled") {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "recharge":
      case "refund":
        return "text-green-600";
      case "debit":
      case "freeze":
      case "payment":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <WalletIcon className="h-8 w-8 text-emerald-600" />
            My Wallet
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your wallet balance and transactions
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                Available Balance
              </h3>
              <button
                onClick={fetchWalletData}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {loading
                ? "Loading..."
                : balance !== null
                ? `LKR ${balance.available_balance.toLocaleString()}`
                : "LKR 0"}
            </p>
          </div>

          {/* Frozen Balance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Frozen Balance
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {loading
                ? "Loading..."
                : balance !== null
                ? `LKR ${balance.frozen_balance.toLocaleString()}`
                : "LKR 0"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Held for active bids</p>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Total Balance
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {loading
                ? "Loading..."
                : balance !== null
                ? `LKR ${balance.total_balance.toLocaleString()}`
                : "LKR 0"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <button
            onClick={() => setShowDepositModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Recharge Wallet
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction History
            </h2>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.type, tx.status)}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {tx.type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${getTransactionColor(
                          tx.type
                        )}`}
                      >
                        {tx.type === "recharge" || tx.type === "refund"
                          ? "+"
                          : "-"}
                        LKR {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          tx.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && walletForModal && (
        <StripeDepositModal
          wallet={walletForModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
}
