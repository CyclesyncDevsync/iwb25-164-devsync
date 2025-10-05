'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useDelivery } from '../../hooks/useDelivery';
import { DeliveryStatus } from '../../types/supplier';

interface DeliveryTrackerProps {
  orderId: string;
}

export default function DeliveryTracker({ orderId }: DeliveryTrackerProps) {
  const { delivery, loading, error, refetch } = useDelivery(orderId);

  const deliveryStatuses: { value: DeliveryStatus; label: string; color: string }[] = [
    { value: DeliveryStatus.PENDING, label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: DeliveryStatus.PICKUP_SCHEDULED, label: 'Pickup Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: DeliveryStatus.PICKED_UP, label: 'Picked Up', color: 'bg-indigo-100 text-indigo-800' },
    { value: DeliveryStatus.IN_TRANSIT, label: 'In Transit', color: 'bg-yellow-100 text-yellow-800' },
    { value: DeliveryStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
    { value: DeliveryStatus.DELIVERED, label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: DeliveryStatus.FAILED, label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: DeliveryStatus.RETURNED, label: 'Returned', color: 'bg-orange-100 text-orange-800' }
  ];

  const getStatusColor = (status: DeliveryStatus) => {
    const statusObj = deliveryStatuses.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: DeliveryStatus) => {
    const statusObj = deliveryStatuses.find(s => s.value === status);
    return statusObj?.label || status;
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.DELIVERED:
        return CheckCircleIcon;
      case DeliveryStatus.FAILED:
      case DeliveryStatus.RETURNED:
        return XCircleIcon;
      case DeliveryStatus.IN_TRANSIT:
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return TruckIcon;
      default:
        return ClockIcon;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800">
          <XCircleIcon className="h-5 w-5" />
          <span className="font-medium">Error loading delivery information</span>
        </div>
        <p className="text-sm text-red-600 mt-2">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery tracking available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Delivery tracking information is not yet available for this order.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(delivery.status);

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Tracking</h3>
        <button
          onClick={refetch}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          title="Refresh"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            {getStatusLabel(delivery.status)}
          </span>
          <span className="text-sm text-gray-500">
            Order: {orderId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {delivery.currentLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Location
              </label>
              <div className="flex items-center text-gray-900">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.currentLocation}
              </div>
            </div>
          )}

          {delivery.driverName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver
              </label>
              <div className="flex items-center text-gray-900">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.driverName}
              </div>
            </div>
          )}

          {delivery.driverPhone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Phone
              </label>
              <div className="flex items-center text-gray-900">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.driverPhone}
              </div>
            </div>
          )}

          {delivery.vehicleNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <div className="flex items-center text-gray-900">
                <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.vehicleNumber}
              </div>
            </div>
          )}

          {delivery.estimatedDeliveryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Delivery
              </label>
              <div className="flex items-center text-gray-900">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.estimatedDeliveryDate.toLocaleString()}
              </div>
            </div>
          )}

          {delivery.actualDeliveryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivered On
              </label>
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {delivery.actualDeliveryDate.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Timeline</h4>

        {delivery.updates && delivery.updates.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {delivery.updates.map((update, updateIdx) => {
                const UpdateStatusIcon = getStatusIcon(update.status);
                return (
                  <li key={update.id}>
                    <div className="relative pb-8">
                      {updateIdx !== delivery.updates.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            updateIdx === 0 ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            <UpdateStatusIcon className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getStatusLabel(update.status)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {update.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              <MapPinIcon className="h-3 w-3 inline mr-1" />
                              {update.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              Updated by: {update.updatedBy}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap">
                            <p className="text-gray-500">
                              {update.timestamp.toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {update.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No delivery updates yet
          </p>
        )}
      </div>
    </div>
  );
}
