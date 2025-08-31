'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../../services/agentManagement';

interface AgentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export function AgentDetailsModal({ isOpen, onClose, agent }: AgentDetailsModalProps) {
  if (!isOpen || !agent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 'suspended':
        return 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'inactive':
        return <ClockIcon className="h-4 w-4" />;
      case 'suspended':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const calculateCompletionRate = (completed: number, total: number) => {
    return total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        <span className="ml-1 capitalize">{agent.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{agent.email}</span>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{agent.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{agent.location}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Assigned Area: {agent.assignedArea}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Work Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Join Date</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(agent.joinDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Active</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(agent.lastActive)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Max Workload</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.currentWorkload}/{agent.maxWorkload} assignments
                        </span>
                      </div>
                      {agent.hourlyRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Hourly Rate</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(agent.hourlyRate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Performance Metrics */}
                <div className="space-y-6">
                  {/* Performance Overview */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Performance Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Rating */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.rating}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(agent.rating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Verifications */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.verificationCount}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Verifications</p>
                          </div>
                          <ChartBarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>

                      {/* Total Assignments */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.totalAssignments}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                          </div>
                          <BriefcaseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>

                      {/* Completed */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.completedAssignments}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                          </div>
                          <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Completion Rate
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {calculateCompletionRate(agent.completedAssignments, agent.totalAssignments)}%
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.completedAssignments} of {agent.totalAssignments}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${calculateCompletionRate(agent.completedAssignments, agent.totalAssignments)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Workload */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Current Workload
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.currentWorkload} / {agent.maxWorkload} assignments
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {((agent.currentWorkload / agent.maxWorkload) * 100).toFixed(0)}% capacity
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (agent.currentWorkload / agent.maxWorkload) > 0.8
                              ? 'bg-red-600'
                              : (agent.currentWorkload / agent.maxWorkload) > 0.6
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                          style={{
                            width: `${(agent.currentWorkload / agent.maxWorkload) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coordinates (if available) */}
                  {agent.coordinates && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Location Coordinates
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>Latitude: {agent.coordinates.latitude.toFixed(6)}</div>
                          <div>Longitude: {agent.coordinates.longitude.toFixed(6)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
