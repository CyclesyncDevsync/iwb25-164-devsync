'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface OrderTrackingProps {
  order: {
    id: string;
    orderNumber: string;
    title: string;
    status: 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
    tracking: {
      status: string;
      location: string;
      lastUpdate: string;
      estimatedArrival: string;
    };
    supplier: {
      name: string;
      contact: string;
    };
  };
}

interface TrackingStep {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

const OrderTrackingCard: React.FC<OrderTrackingProps> = ({ order }) => {
  const [showFullTracking, setShowFullTracking] = useState(false);

  const trackingSteps: TrackingStep[] = [
    {
      id: '1',
      status: 'Order Confirmed',
      location: 'Supplier Warehouse',
      timestamp: '2024-01-10 16:45',
      description: 'Order confirmed and being prepared',
      completed: true
    },
    {
      id: '2',
      status: 'Shipped',
      location: 'Mumbai Warehouse',
      timestamp: '2024-01-14 09:15',
      description: 'Package has been shipped from supplier',
      completed: true
    },
    {
      id: '3',
      status: 'In Transit',
      location: 'Pune Distribution Center',
      timestamp: '2024-01-15 14:30',
      description: 'Package is on the way to your location',
      completed: order.status === 'in_transit' || order.status === 'delivered'
    },
    {
      id: '4',
      status: 'Out for Delivery',
      location: 'Local Delivery Hub',
      timestamp: '',
      description: 'Package is out for delivery',
      completed: order.status === 'delivered'
    },
    {
      id: '5',
      status: 'Delivered',
      location: 'Your Location',
      timestamp: '',
      description: 'Package has been delivered',
      completed: order.status === 'delivered'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-yellow-600 bg-yellow-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return ClockIcon;
      case 'in_transit': return TruckIcon;
      case 'delivered': return CheckCircleIcon;
      case 'cancelled': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{order.title}</h3>
          <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
          <StatusIcon className="h-4 w-4 inline mr-1" />
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <TruckIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">{order.tracking.status}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
          <MapPinIcon className="h-4 w-4" />
          <span>{order.tracking.location}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700">Last updated: {order.tracking.lastUpdate}</span>
          <span className="font-medium text-blue-900">ETA: {order.tracking.estimatedArrival}</span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
          <button
            onClick={() => setShowFullTracking(!showFullTracking)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            {showFullTracking ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {trackingSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : index === trackingSteps.findIndex(s => !s.completed)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center max-w-16">
                  {step.status.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ 
                width: `${(trackingSteps.filter(s => s.completed).length - 1) * 25}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detailed Tracking */}
      {showFullTracking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mb-6"
        >
          {trackingSteps.filter(step => step.completed || step.timestamp).map((step, index) => (
            <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                step.completed ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{step.status}</span>
                  {step.timestamp && (
                    <span className="text-sm text-gray-500">{step.timestamp}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.location}</p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
          <TruckIcon className="h-4 w-4 inline mr-1" />
          Live Tracking
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
          <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
          Contact Supplier
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
          <PhoneIcon className="h-4 w-4 inline mr-1" />
          Call
        </button>
      </div>

      {/* Supplier Info */}
      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Supplier: {order.supplier.name}</span>
          <span>Contact: {order.supplier.contact}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingCard;
