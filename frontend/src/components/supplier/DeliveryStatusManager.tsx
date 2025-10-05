'use client';

import React, { useState } from 'react';
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
import { DeliveryStatus, DeliveryTracking, DeliveryUpdate } from '../../types/supplier';
import { useDelivery } from '../../hooks/useDelivery';

interface DeliveryStatusManagerProps {
  orderId: string;
}

export default function DeliveryStatusManager({
  orderId
}: DeliveryStatusManagerProps) {
  const { delivery, loading, error, refetch, updateStatus } = useDelivery(orderId);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !location || !description) {
      setUpdateError('Please fill all fields');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await updateStatus(selectedStatus as DeliveryStatus, location, description, 'supplier');
      setSelectedStatus('');
      setLocation('');
      setDescription('');
      setUpdateSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update delivery status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <XCircleIcon className="h-5 w-5" />
            <span className="font-medium">Error loading delivery information</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="text-center py-8">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No delivery tracking</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Delivery tracking will be available once the order is confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Management</h3>
        <button
          onClick={refetch}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Refresh"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Success Message */}
      {updateSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">Status updated successfully!</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {updateError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <XCircleIcon className="h-5 w-5" />
            <span className="font-medium">{updateError}</span>
          </div>
        </div>
      )}

      {/* Current Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Delivery Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
              {React.createElement(getStatusIcon(delivery.status), { className: 'h-4 w-4 mr-2' })}
              {deliveryStatuses.find(s => s.value === delivery.status)?.label}
            </span>
          </div>

          {delivery.currentLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Location
              </label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.currentLocation}
              </div>
            </div>
          )}

          {delivery.driverName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver
              </label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.driverName}
              </div>
            </div>
          )}

          {delivery.driverPhone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver Phone
              </label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.driverPhone}
              </div>
            </div>
          )}

          {delivery.vehicleNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle Number
              </label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                {delivery.vehicleNumber}
              </div>
            </div>
          )}

          {delivery.estimatedDeliveryDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Delivery
              </label>
              <div className="flex items-center text-gray-900 dark:text-white">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                {new Date(delivery.estimatedDeliveryDate).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Update Delivery Status</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DeliveryStatus)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select status...</option>
              {deliveryStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter current location..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter status update description..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || !selectedStatus || !location || !description}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delivery Timeline</h3>

        {delivery.updates && delivery.updates.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {delivery.updates.map((update, updateIdx) => {
                const StatusIcon = getStatusIcon(update.status);
                return (
                  <li key={update.id}>
                    <div className="relative pb-8">
                      {updateIdx !== delivery.updates.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                            updateIdx === 0 ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}>
                            <StatusIcon className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {deliveryStatuses.find(s => s.value === update.status)?.label}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {update.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              <MapPinIcon className="h-3 w-3 inline mr-1" />
                              {update.location}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap">
                            <p className="text-gray-500 dark:text-gray-400">
                              {new Date(update.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                              {new Date(update.timestamp).toLocaleTimeString()}
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
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No delivery updates yet
          </p>
        )}
      </div>
    </div>
  );
}
