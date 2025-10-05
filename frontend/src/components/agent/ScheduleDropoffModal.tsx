'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, TruckIcon, HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';

interface Assignment {
  id: string;
  assignmentId: string;
  materialId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  materialDetails: {
    title: string;
    type: string;
    quantity: number;
    unit: string;
    condition: string;
    description: string;
    expectedPrice: number;
    deliveryMethod?: string;
  };
  warehouse?: {
    name?: string;
    address?: string;
    phone?: string;
  };
}

interface ScheduleDropoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onConfirm: (scheduleData: any) => Promise<void>;
}

const TIME_SLOTS = [
  { value: '09:00-11:00', label: '9:00 AM - 11:00 AM' },
  { value: '11:00-13:00', label: '11:00 AM - 1:00 PM' },
  { value: '14:00-16:00', label: '2:00 PM - 4:00 PM' },
  { value: '16:00-18:00', label: '4:00 PM - 6:00 PM' },
];

const TRANSPORT_METHODS = [
  { value: 'own_vehicle', label: 'Own Vehicle', icon: HomeIcon },
  { value: 'hired_transport', label: 'Hired Transport', icon: TruckIcon },
  { value: 'courier', label: 'Courier Service', icon: BuildingOfficeIcon },
];

export default function ScheduleDropoffModal({ isOpen, onClose, assignment, onConfirm }: ScheduleDropoffModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dropoffDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Default to tomorrow
    dropoffTimeSlot: '',
    warehouseName: assignment?.warehouse?.name || '',
    warehouseAddress: assignment?.warehouse?.address || '',
    warehousePhone: assignment?.warehouse?.phone || '',
    transportMethod: '',
    vehicleType: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    estimatedArrivalTime: '',
    estimatedWeight: assignment?.materialDetails?.quantity || '',
    specialInstructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        assignmentId: assignment.assignmentId,
        materialId: assignment.materialId,
        supplierId: assignment.supplierId,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error('Failed to schedule dropoff:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update warehouse info when assignment changes
  React.useEffect(() => {
    if (assignment?.warehouse) {
      setFormData(prev => ({
        ...prev,
        warehouseName: assignment.warehouse?.name || '',
        warehouseAddress: assignment.warehouse?.address || '',
        warehousePhone: assignment.warehouse?.phone || '',
      }));
    }
  }, [assignment]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-4 sm:px-6 flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-gray-900">
                      Schedule Drop-off
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-5 sm:p-6 space-y-6">
                    {/* Material Info */}
                    {assignment && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Material Details</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><span className="font-medium">Material:</span> {assignment.materialDetails.title}</p>
                          <p><span className="font-medium">Quantity:</span> {assignment.materialDetails.quantity} {assignment.materialDetails.unit}</p>
                          <p><span className="font-medium">Supplier:</span> {assignment.supplierName}</p>
                        </div>
                      </div>
                    )}

                    {/* Schedule Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="dropoffDate" className="block text-sm font-medium text-gray-700">
                            Drop-off Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="dropoffDate"
                            name="dropoffDate"
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
                            value={formData.dropoffDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="dropoffTimeSlot" className="block text-sm font-medium text-gray-700">
                            Time Slot <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="dropoffTimeSlot"
                            name="dropoffTimeSlot"
                            required
                            value={formData.dropoffTimeSlot}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          >
                            <option value="">Select a time slot</option>
                            {TIME_SLOTS.map(slot => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Warehouse Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Warehouse Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium text-gray-700">Name:</span> {formData.warehouseName || 'Not specified'}</p>
                          <p><span className="font-medium text-gray-700">Address:</span> {formData.warehouseAddress || 'Not specified'}</p>
                          {formData.warehousePhone && (
                            <p><span className="font-medium text-gray-700">Phone:</span> {formData.warehousePhone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transport Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Transport Method <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {TRANSPORT_METHODS.map((method) => (
                              <label
                                key={method.value}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                                  formData.transportMethod === method.value
                                    ? 'border-agent-DEFAULT ring-2 ring-agent-DEFAULT'
                                    : 'border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="transportMethod"
                                  value={method.value}
                                  checked={formData.transportMethod === method.value}
                                  onChange={handleChange}
                                  className="sr-only"
                                  required
                                />
                                <div className="flex flex-col items-center text-center w-full">
                                  <method.icon className="h-6 w-6 mb-2 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-900">{method.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {formData.transportMethod && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {formData.transportMethod !== 'courier' && (
                              <>
                                <div>
                                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                                    Vehicle Type
                                  </label>
                                  <input
                                    type="text"
                                    id="vehicleType"
                                    name="vehicleType"
                                    placeholder="e.g., Van, Truck"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                                    Vehicle Number
                                  </label>
                                  <input
                                    type="text"
                                    id="vehicleNumber"
                                    name="vehicleNumber"
                                    placeholder="e.g., ABC-1234"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
                                    Driver Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    id="driverName"
                                    name="driverName"
                                    required
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="driverPhone" className="block text-sm font-medium text-gray-700">
                                    Driver Phone <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    id="driverPhone"
                                    name="driverPhone"
                                    required
                                    placeholder="+94 XX XXX XXXX"
                                    value={formData.driverPhone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="estimatedArrivalTime" className="block text-sm font-medium text-gray-700">
                              Estimated Arrival Time
                            </label>
                            <input
                              type="time"
                              id="estimatedArrivalTime"
                              name="estimatedArrivalTime"
                              value={formData.estimatedArrivalTime}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="estimatedWeight" className="block text-sm font-medium text-gray-700">
                              Estimated Weight (kg)
                            </label>
                            <input
                              type="number"
                              id="estimatedWeight"
                              name="estimatedWeight"
                              step="0.01"
                              value={formData.estimatedWeight}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">
                            Special Instructions
                          </label>
                          <textarea
                            id="specialInstructions"
                            name="specialInstructions"
                            rows={3}
                            placeholder="Any special handling instructions or notes"
                            value={formData.specialInstructions}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agent-DEFAULT disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}