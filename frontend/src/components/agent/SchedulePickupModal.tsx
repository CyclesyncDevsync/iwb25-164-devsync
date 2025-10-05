'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
  materialLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
}

interface SchedulePickupModalProps {
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

export default function SchedulePickupModal({ isOpen, onClose, assignment, onConfirm }: SchedulePickupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickupDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'), // Default to tomorrow
    pickupTimeSlot: '',
    contactPerson: '',
    contactPhone: '',
    alternatePhone: '',
    pickupAddress: assignment?.materialLocation?.address || '',
    landmark: '',
    accessInstructions: '',
    estimatedWeight: assignment?.materialDetails?.quantity || '',
    packagingAvailable: false,
    specialRequirements: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        assignmentId: assignment.assignmentId,
        materialId: assignment.materialId,
        agentId: assignment.agentId || '', // This should be set from the assignment
        supplierId: assignment.supplierId,
        ...formData,
      });
      onClose();
    } catch (error) {
      console.error('Failed to schedule pickup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Update address when assignment changes
  React.useEffect(() => {
    if (assignment?.materialLocation?.address) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: assignment.materialLocation.address,
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
                      Schedule Pickup
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
                          <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">
                            Pickup Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="pickupDate"
                            name="pickupDate"
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
                            value={formData.pickupDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="pickupTimeSlot" className="block text-sm font-medium text-gray-700">
                            Time Slot <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="pickupTimeSlot"
                            name="pickupTimeSlot"
                            required
                            value={formData.pickupTimeSlot}
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

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                            Contact Person <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="contactPerson"
                            name="contactPerson"
                            required
                            value={formData.contactPerson}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                            Contact Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            required
                            placeholder="+94 XX XXX XXXX"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="alternatePhone" className="block text-sm font-medium text-gray-700">
                            Alternate Phone
                          </label>
                          <input
                            type="tel"
                            id="alternatePhone"
                            name="alternatePhone"
                            placeholder="+94 XX XXX XXXX"
                            value={formData.alternatePhone}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Location</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">
                            Pickup Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id="pickupAddress"
                            name="pickupAddress"
                            required
                            rows={3}
                            value={formData.pickupAddress}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">
                            Nearby Landmark
                          </label>
                          <input
                            type="text"
                            id="landmark"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="accessInstructions" className="block text-sm font-medium text-gray-700">
                            Access Instructions
                          </label>
                          <textarea
                            id="accessInstructions"
                            name="accessInstructions"
                            rows={2}
                            placeholder="Any special instructions for accessing the location"
                            value={formData.accessInstructions}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-agent-DEFAULT focus:ring-agent-DEFAULT sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="packagingAvailable"
                              name="packagingAvailable"
                              checked={formData.packagingAvailable}
                              onChange={handleChange}
                              className="h-4 w-4 text-agent-DEFAULT focus:ring-agent-DEFAULT border-gray-300 rounded"
                            />
                            <label htmlFor="packagingAvailable" className="ml-2 block text-sm text-gray-700">
                              Packaging materials available at location
                            </label>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700">
                            Special Requirements or Notes
                          </label>
                          <textarea
                            id="specialRequirements"
                            name="specialRequirements"
                            rows={3}
                            value={formData.specialRequirements}
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