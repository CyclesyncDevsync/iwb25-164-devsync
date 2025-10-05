'use client';

import React, { useState } from 'react';
import OrderCardWithDelivery from '../../../components/buyer/OrderCardWithDelivery';
import DeliveryTracker from '../../../components/delivery/DeliveryTracker';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Sample orders - replace with real data from your API
const sampleOrders = [
  {
    id: 'ord-2024-001',
    orderNumber: 'ORD-2024-001',
    title: 'Premium Plastic Bottles - PET Grade A',
    totalAmount: 7500,
    status: 'in_transit',
    orderDate: '2024-01-10'
  },
  {
    id: 'ord-2024-002',
    orderNumber: 'ORD-2024-002',
    title: 'Mixed Paper Waste - Office Grade',
    totalAmount: 1600,
    status: 'delivered',
    orderDate: '2024-01-05'
  },
  {
    id: 'ord-2024-003',
    orderNumber: 'ORD-2024-003',
    title: 'Aluminum Scrap - Food Grade',
    totalAmount: 8500,
    status: 'confirmed',
    orderDate: '2024-01-14'
  }
];

export default function BuyerOrdersWithDelivery() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered'>('all');

  const filteredOrders = sampleOrders.filter(order => {
    switch (activeTab) {
      case 'active':
        return ['confirmed', 'in_transit'].includes(order.status);
      case 'delivered':
        return order.status === 'delivered';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: 'All Orders', count: sampleOrders.length },
                { key: 'active', label: 'Active', count: sampleOrders.filter(o => ['confirmed', 'in_transit'].includes(o.status)).length },
                { key: 'delivered', label: 'Delivered', count: sampleOrders.filter(o => o.status === 'delivered').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCardWithDelivery
              key={order.id}
              order={order}
              onViewDetails={() => setSelectedOrderId(order.id)}
            />
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {/* Delivery Tracking Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrderId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Order Tracking</h3>
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <DeliveryTracker orderId={selectedOrderId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
