'use client';

import React from 'react';
import { CheckCircleIcon, CalendarIcon, ClockIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ScheduleConfirmationProps {
  confirmationData: {
    confirmationCode: string;
    scheduleDate: string;
    timeSlot: string;
    type: 'pickup' | 'dropoff';
    location?: string;
    warehouse?: string;
  };
  onClose: () => void;
}

export default function ScheduleConfirmation({ confirmationData, onClose }: ScheduleConfirmationProps) {
  const formatTimeSlot = (slot: string) => {
    const [start, end] = slot.split('-');
    return `${start} - ${end}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {confirmationData.type === 'pickup' ? 'Pickup' : 'Drop-off'} Scheduled Successfully!
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-center text-gray-600 mb-3">Your confirmation code is:</p>
            <p className="text-2xl font-bold text-center text-agent-DEFAULT">
              {confirmationData.confirmationCode}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-gray-700">
              <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium mr-2">Date:</span>
              <span>{format(new Date(confirmationData.scheduleDate), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium mr-2">Time:</span>
              <span>{formatTimeSlot(confirmationData.timeSlot)}</span>
            </div>
            
            {confirmationData.type === 'dropoff' && confirmationData.warehouse && (
              <div className="flex items-start text-gray-700">
                <DocumentIcon className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                <div>
                  <span className="font-medium">Warehouse:</span>
                  <p className="text-sm">{confirmationData.warehouse}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              {confirmationData.type === 'pickup' 
                ? 'The agent will arrive at the scheduled time. Please ensure someone is available at the location.'
                : 'Please arrive at the warehouse within your scheduled time slot with your confirmation code.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-agent-DEFAULT text-white py-2 px-4 rounded-md hover:bg-agent-DEFAULT/90 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}