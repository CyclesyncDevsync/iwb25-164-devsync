'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DocumentCheckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AgentLayout from '@/components/layout/AgentLayout';
import { useAuth } from '@/hooks/useAuth';
import { MaterialDetailsModal } from '@/components/agent/MaterialDetailsModal';

interface Assignment {
  id: string;
  assignmentId: string;
  materialId: string;
  supplierId: string;
  supplierName: string;
  materialDetails: {
    title: string;
    type: string;
    quantity: number;
    unit: string;
    condition: string;
    description: string;
    expectedPrice: number;
  };
  materialLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTime: number;
  notes?: string;
}

type TabType = 'pending' | 'ongoing' | 'completed';

const VerifyPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    const userId = user?.asgardeoId || user?.asgardeo_id;
    if (!userId) {
      console.log('No user ID available');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/backend/agent/${userId}/assignments`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.assignments) {
          // Transform backend data to match new interface
          const transformedAssignments = data.assignments.map((assignment: any) => ({
            id: assignment.assignmentId || assignment.id,
            assignmentId: assignment.assignmentId || assignment.id,
            materialId: assignment.materialId || assignment.materialDetails?.id,
            supplierId: assignment.supplierId,
            supplierName: assignment.supplierName || 'Unknown Supplier',
            materialDetails: {
              title: assignment.materialDetails?.title || `${assignment.materialDetails?.type || 'Material'} Submission`,
              type: assignment.materialDetails?.type || 'Material',
              quantity: parseFloat(assignment.materialDetails?.quantity) || 1,
              unit: assignment.materialDetails?.unit || 'kg',
              condition: assignment.materialDetails?.condition || 'good',
              description: assignment.materialDetails?.description || 'No description',
              expectedPrice: parseFloat(assignment.materialDetails?.expectedPrice) || 0,
            },
            materialLocation: {
              latitude: assignment.materialLocation?.latitude || 6.9271,
              longitude: assignment.materialLocation?.longitude || 79.8612,
              address: assignment.location?.address || assignment.materialLocation?.address || 'Address not specified',
            },
            status: assignment.status || 'pending',
            urgency: assignment.urgency || 'medium',
            createdAt: assignment.createdAt || new Date().toISOString(),
            assignedAt: assignment.assignedAt || new Date().toISOString(),
            startedAt: assignment.startedAt,
            completedAt: assignment.completedAt,
            estimatedTime: Math.ceil(assignment.agent?.costBreakdown?.estimatedDuration * 60) || 45,
            notes: assignment.notes,
          }));
          
          setAssignments(transformedAssignments);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string, additionalData?: any) => {
    setActionLoading(assignmentId);
    try {
      const response = await fetch(`/backend/agent/assignment/${assignmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      });

      if (response.ok) {
        // Update local state
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: newStatus as any, ...additionalData }
            : assignment
        ));
      } else {
        console.error('Failed to update assignment status');
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  // Filter assignments by tab
  const filteredAssignments = assignments.filter(assignment => {
    switch (activeTab) {
      case 'pending':
        return assignment.status === 'pending';
      case 'ongoing':
        return assignment.status === 'in-progress';
      case 'completed':
        return assignment.status === 'completed' || assignment.status === 'rejected';
      default:
        return false;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'in-progress': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const handleStartVerification = async (assignmentId: string) => {
    await updateAssignmentStatus(assignmentId, 'in-progress', {
      startedAt: new Date().toISOString()
    });
  };

  const handleCompleteVerification = async (assignmentId: string) => {
    await updateAssignmentStatus(assignmentId, 'completed', {
      completedAt: new Date().toISOString()
    });
  };

  const viewDetails = (assignment: Assignment) => {
    setSelectedAssignmentForDetails(assignment);
    setShowDetailsModal(true);
  };

  const tabs = [
    { key: 'pending' as TabType, label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
    { key: 'ongoing' as TabType, label: 'Ongoing', count: assignments.filter(a => a.status === 'in-progress').length },
    { key: 'completed' as TabType, label: 'Completed', count: assignments.filter(a => ['completed', 'rejected'].includes(a.status)).length },
  ];

  if (isLoading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        {/* Header */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b">
          <div className="px-4 py-6 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <DocumentCheckIcon className="w-8 h-8 text-agent-DEFAULT mr-3" />
                  Material Verifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your assigned material verification tasks
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {assignments.length} assignments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 lg:px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.key
                      ? 'border-agent-DEFAULT text-agent-DEFAULT'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                      ${activeTab === tab.key
                        ? 'bg-agent-DEFAULT text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'pending' && <ClockIcon className="w-12 h-12 text-gray-400" />}
                {activeTab === 'ongoing' && <PlayIcon className="w-12 h-12 text-gray-400" />}
                {activeTab === 'completed' && <CheckCircleIcon className="w-12 h-12 text-gray-400" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === 'pending' && 'No pending verifications'}
                {activeTab === 'ongoing' && 'No ongoing verifications'}
                {activeTab === 'completed' && 'No completed verifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'pending' && 'All assignments have been started or completed'}
                {activeTab === 'ongoing' && 'No verifications are currently in progress'}
                {activeTab === 'completed' && 'No verifications have been completed yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {assignment.materialDetails.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.supplierName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.urgency)}`}>
                        {assignment.urgency} priority
                      </span>
                    </div>
                  </div>

                  {/* Material Details */}
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Material Details:
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{assignment.materialDetails.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {assignment.materialDetails.quantity} {assignment.materialDetails.unit}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Condition:</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{assignment.materialDetails.condition}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Expected Price:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${assignment.materialDetails.expectedPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          <span className="truncate">{assignment.materialLocation.address}</span>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Est. {assignment.estimatedTime}min
                        </div>
                        <div className="text-xs">
                          Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Description */}
                      {assignment.materialDetails.description && assignment.materialDetails.description !== 'No description' && (
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                            "{assignment.materialDetails.description}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-3">
                      {assignment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStartVerification(assignment.id)}
                            disabled={actionLoading === assignment.id}
                            className="flex-1 bg-agent-DEFAULT text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-agent-DEFAULT/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {actionLoading === assignment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <>
                                <PlayIcon className="w-4 h-4 mr-2" />
                                Start Verification
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => viewDetails(assignment)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </>
                      )}
                      
                      {assignment.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => handleCompleteVerification(assignment.id)}
                            disabled={actionLoading === assignment.id}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {actionLoading === assignment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                              <>
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Complete
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => viewDetails(assignment)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </>
                      )}
                      
                      {(assignment.status === 'completed' || assignment.status === 'rejected') && (
                        <button
                          onClick={() => viewDetails(assignment)}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Material Details Modal */}
      <MaterialDetailsModal
        assignment={selectedAssignmentForDetails}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAssignmentForDetails(null);
        }}
      />
    </AgentLayout>
  );
};

export default VerifyPage;
