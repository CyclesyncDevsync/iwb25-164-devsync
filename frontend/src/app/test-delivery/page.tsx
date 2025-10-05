'use client';

import React, { useState } from 'react';
import DeliveryTracker from '../../components/delivery/DeliveryTracker';

export default function TestDeliveryPage() {
  const [orderId, setOrderId] = useState('ord-2024-001');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Tracking Test</h1>
          <p className="mt-2 text-gray-600">
            Test the delivery tracking system with real data from the backend
          </p>
        </div>

        {/* Order ID Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Order ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., ord-2024-001"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={() => setOrderId(orderId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Load
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Try: ord-2024-001, ord-2024-002, or ord-2024-003
          </p>
        </div>

        {/* Delivery Tracker */}
        {orderId && <DeliveryTracker orderId={orderId} />}
      </div>
    </div>
  );
}
