'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPinIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, BellIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import AgentLayout from '@/components/layout/AgentLayout';
import QuickActionCard from '@/components/agent/QuickActionCard';
import AssignmentCard from '@/components/agent/AssignmentCard';
import GPSTaskList from '@/components/agent/GPSTaskList';
import { useAuth } from '@/hooks/useAuth';
import WalletBalance from '@/components/shared/WalletBalance';

interface BackendAssignment {
  assignmentId?: string;
  id?: string;
  materialDetails?: {
    title?: string;
    type?: string;
    quantity?: string;
  };
  location?: {
    address?: string;
  };
  materialLocation?: {
    latitude?: number;
    longitude?: number;
  };
  urgency?: string;
  status?: string;
  createdAt?: string;
  supplierName?: string;
  agent?: {
    agentPhone?: string;
    costBreakdown?: {
      estimatedDuration?: number;
    };
  };
}

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
  estimatedTime: number; // in minutes
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

const AgentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showNotificationBar, setShowNotificationBar] = useState(false);
  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayPending: 0,
    weeklyTotal: 0,
    rating: 4.8
  });

  // Fetch assignments from backend
  const fetchAssignments = useCallback(async () => {
    const userId = user?.asgardeoId;
    if (!userId) {
      console.log('No user ID available, skipping assignment fetch');
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
          // Transform backend assignment data to match frontend interface
          const transformedAssignments = data.assignments.map((assignment: BackendAssignment) => ({
            id: assignment.assignmentId || assignment.id,
            type: 'verification' as const,
            title: assignment.materialDetails?.title || 'Material Verification',
            location: {
              address: assignment.location?.address || 'Address not specified',
              coordinates: { 
                lat: assignment.materialLocation?.latitude || 6.9271, 
                lng: assignment.materialLocation?.longitude || 79.8612 
              }
            },
            priority: assignment.urgency || 'medium',
            status: assignment.status || 'pending',
            estimatedTime: assignment.agent?.costBreakdown?.estimatedDuration ? Math.ceil(assignment.agent.costBreakdown.estimatedDuration * 60) : 45,
            supplier: {
              name: assignment.supplierName || 'Unknown Supplier',
              contact: assignment.agent?.agentPhone || 'Contact not available'
            },
            materials: assignment.materialDetails ? [{
              type: assignment.materialDetails.type || 'Material',
              quantity: assignment.materialDetails.quantity ? parseFloat(assignment.materialDetails.quantity) : 1,
              unit: 'kg'
            }] : [],
            deadline: assignment.createdAt ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : new Date().toISOString()
          }));
          
          setAssignments(transformedAssignments);
          console.log('Assignments loaded:', transformedAssignments);
          
          // Calculate real stats from assignments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayAssignments = transformedAssignments.filter((assignment: Assignment) => {
            const assignmentDate = new Date(assignment.deadline);
            assignmentDate.setHours(0, 0, 0, 0);
            return assignmentDate.getTime() === today.getTime();
          });
          
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          
          const weeklyAssignments = transformedAssignments.filter((assignment: Assignment) => {
            const assignmentDate = new Date(assignment.deadline);
            return assignmentDate >= weekStart;
          });
          
          setStats({
            todayCompleted: todayAssignments.filter((a: Assignment) => a.status === 'completed').length,
            todayPending: todayAssignments.filter((a: Assignment) => a.status === 'pending').length,
            weeklyTotal: weeklyAssignments.length,
            rating: 4.8 // TODO: Get real rating from backend
          });
        }
      } else {
        console.log('Failed to fetch assignments:', response.status);
        // Fall back to empty assignments on error
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Fall back to empty assignments on error
      setAssignments([]);
    }
  }, [user]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation access denied or unavailable:', error.message || 'Unknown error');
          // Set a default location if geolocation fails
          setCurrentLocation({
            lat: 6.9271, // Default to Colombo, Sri Lanka
            lng: 79.8612
          });
        }
      );
    }

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch real assignments from backend API
    fetchAssignments();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAssignments]);

  const quickActions = [
    {
      title: 'Start Verification',
      description: 'Begin material verification process',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      href: '/agent/verify'
    },
    {
      title: 'Report Issue',
      description: 'Report problems or discrepancies',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      href: '/agent/report'
    },
    {
      title: 'Contact Support',
      description: 'Get help from admin team',
      icon: ClockIcon,
      color: 'bg-blue-500',
      href: '/agent/support'
    }
  ];

  return (
    <AgentLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b lg:border-b-0">
          <div className="px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName || 'Agent'}
                </h2>
                {/* Date Display */}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notification Icon */}
                <button
                  onClick={() => setShowNotificationBar(!showNotificationBar)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative"
                >
                  <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Popup */}
        {showNotificationBar && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowNotificationBar(false)}
            ></div>

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 right-4 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <button
                    onClick={() => setShowNotificationBar(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Sample notifications - you can replace with real data */}
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">New assignment available</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Assignment completed successfully</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Payment received</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Profile updated</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowNotificationBar(false)}
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        <div className="px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* GPS-enabled Task List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Today's Assignments
                  </h2>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    GPS Enabled
                  </div>
                </div>
                <GPSTaskList 
                  assignments={assignments} 
                  currentLocation={currentLocation}
                  onAssignmentUpdate={setAssignments}
                />
              </div>

              {/* Assignment Cards */}
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment}
                    currentLocation={currentLocation}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm"
                >
                  <div className="text-2xl font-bold text-agent-DEFAULT dark:text-agent-dark">
                    {stats.todayCompleted}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completed Today</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm"
                >
                  <div className="text-2xl font-bold text-orange-500">
                    {stats.todayPending}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pending Tasks</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm"
                >
                  <div className="text-2xl font-bold text-green-500">
                    {stats.weeklyTotal}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">This Week</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm"
                >
                  <div className="text-2xl font-bold text-yellow-500">
                    {stats.rating}⭐
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Rating</div>
                </motion.div>
              </div>

              {/* Wallet Balance */}
              <div>
                <WalletBalance />
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, index) => (
                    <QuickActionCard key={index} action={action} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
};

export default AgentDashboard;
