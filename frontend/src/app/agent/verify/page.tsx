'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DocumentCheckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AgentLayout from '@/components/layout/AgentLayout';

interface Assignment {
  id: string;
  type: 'verification' | 'collection' | 'inspection';
  title: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: number;
  supplier: {
    name: string;
    contact: string;
  };
  materials?: {
    type: string;
    quantity: number;
    unit: string;
  }[];
  deadline: string;
}

const VerifyPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setAssignments([
        {
          id: '1',
          type: 'verification',
          title: 'Verify Plastic Bottles Collection',
          location: {
            address: 'Colombo 07, Western Province',
            coordinates: { lat: 6.9271, lng: 79.8612 }
          },
          priority: 'high',
          status: 'pending',
          estimatedTime: 45,
          supplier: {
            name: 'Green Recyclers Pvt Ltd',
            contact: '+94 77 123 4567'
          },
          materials: [
            { type: 'PET Bottles', quantity: 500, unit: 'kg' }
          ],
          deadline: '2025-08-20T14:00:00Z'
        },
        {
          id: '2',
          type: 'collection',
          title: 'Metal Scrap Collection',
          location: {
            address: 'Kandy, Central Province',
            coordinates: { lat: 7.2906, lng: 80.6337 }
          },
          priority: 'medium',
          status: 'pending',
          estimatedTime: 60,
          supplier: {
            name: 'Metal Works Lanka',
            contact: '+94 81 223 4567'
          },
          materials: [
            { type: 'Aluminum', quantity: 200, unit: 'kg' },
            { type: 'Steel', quantity: 150, unit: 'kg' }
          ],
          deadline: '2025-08-20T16:30:00Z'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-agent-DEFAULT"></div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Content Section */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b lg:border-b-0">
          <div className="px-4 py-6 lg:px-6">
            <div className="text-center lg:text-left">
              <DocumentCheckIcon className="w-16 h-16 text-agent-DEFAULT mx-auto lg:hidden mb-4" />
              <p className="text-gray-600 dark:text-gray-400 lg:text-lg">
                Select an assignment to begin verification process
              </p>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Pending Verifications
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} waiting for verification
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No pending verifications at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/agent/verify/${assignment.id}`}>
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {assignment.supplier.name}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority} priority
                          </span>
                        </div>
                      </div>

                      {/* Materials */}
                      {assignment.materials && assignment.materials.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Materials to verify:
                          </h4>
                          <div className="space-y-1">
                            {assignment.materials.map((material, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {material.type}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {material.quantity} {material.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Info Row */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {assignment.location.address}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {assignment.estimatedTime}min
                          </div>
                        </div>
                      </div>

                      {/* Deadline Warning */}
                      {new Date(assignment.deadline).getTime() - Date.now() < 2 * 60 * 60 * 1000 && (
                        <div className="mt-3 flex items-center text-red-600 dark:text-red-400 text-sm">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Due: {new Date(assignment.deadline).toLocaleString()}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-4">
                        <div className="bg-agent-DEFAULT text-white text-center py-2 px-4 rounded-md font-medium hover:bg-agent-DEFAULT/90 transition-colors">
                          Start Verification
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AgentLayout>
  );
};

export default VerifyPage;
