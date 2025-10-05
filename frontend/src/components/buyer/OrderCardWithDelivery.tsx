'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useDelivery } from '../../hooks/useDelivery';
import { DeliveryStatus } from '../../types/supplier';

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

interface OrderCardWithDeliveryProps {
  order: Order;
  onViewDetails?: () => void;
}

export default function OrderCardWithDelivery({ order, onViewDetails }: OrderCardWithDeliveryProps) {
  const { delivery, loading } = useDelivery(order.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-yellow-600 bg-yellow-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeliveryStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case DeliveryStatus.IN_TRANSIT:
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-800';
      case DeliveryStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-900">{order.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
            <p className="text-sm text-gray-500">Ordered on {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Delivery Information */}
        {loading && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {delivery && (
          <div className="mb-4">
            {/* In Transit / Out for Delivery */}
            {(delivery.status === DeliveryStatus.IN_TRANSIT || delivery.status === DeliveryStatus.OUT_FOR_DELIVERY) && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      {delivery.status === DeliveryStatus.OUT_FOR_DELIVERY ? 'OUT FOR DELIVERY' : 'IN TRANSIT'}
                    </span>
                  </div>
                  {delivery.estimatedDeliveryDate && (
                    <span className="text-sm text-blue-700 font-medium">
                      ETA: {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {delivery.currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-medium">Current Location:</span>
                      <span>{delivery.currentLocation}</span>
                    </div>
                  )}

                  {delivery.driverName && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <UserIcon className="h-4 w-4" />
                      <span>Driver: {delivery.driverName}</span>
                      {delivery.driverPhone && (
                        <>
                          <span>•</span>
                          <PhoneIcon className="h-4 w-4" />
                          <span>{delivery.driverPhone}</span>
                        </>
                      )}
                    </div>
                  )}

                  {delivery.vehicleNumber && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <TruckIcon className="h-4 w-4" />
                      <span>Vehicle: {delivery.vehicleNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivered */}
            {delivery.status === DeliveryStatus.DELIVERED && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    Delivered on {delivery.actualDeliveryDate ? new Date(delivery.actualDeliveryDate).toLocaleDateString() : 'N/A'}
                  </span>
                  {delivery.driverName && (
                    <>
                      <span>•</span>
                      <span>by {delivery.driverName}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pending/Pickup Scheduled */}
            {(delivery.status === DeliveryStatus.PENDING || delivery.status === DeliveryStatus.PICKUP_SCHEDULED) && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">
                    {delivery.status === DeliveryStatus.PICKUP_SCHEDULED ? 'Pickup Scheduled' : 'Preparing for Pickup'}
                  </span>
                  {delivery.estimatedDeliveryDate && (
                    <>
                      <span>•</span>
                      <span>Expected: {new Date(delivery.estimatedDeliveryDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium"
          >
            <EyeIcon className="h-4 w-4 inline mr-1" />
            View Details
          </button>

          {delivery && (delivery.status === DeliveryStatus.IN_TRANSIT || delivery.status === DeliveryStatus.OUT_FOR_DELIVERY) && (
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <TruckIcon className="h-4 w-4 inline mr-1" />
              Track Order
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
