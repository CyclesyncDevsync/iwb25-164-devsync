'use client';

import { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import AgentLayout from '@/components/layout/AgentLayout';
import QuickActionCard from '@/components/agent/QuickActionCard';
import AssignmentCard from '@/components/agent/AssignmentCard';
import GPSTaskList from '@/components/agent/GPSTaskList';
import { useAuth } from '@/hooks/useAuth';

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
  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayPending: 0,
    weeklyTotal: 0,
    rating: 4.8
  });

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
          console.error('Error getting location:', error);
        }
      );
    }

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mock data - Replace with actual API calls
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
        status: 'in-progress',
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

    setStats({
      todayCompleted: 3,
      todayPending: 2,
      weeklyTotal: 18,
      rating: 4.8
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
        {/* Welcome Section with online status */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b lg:border-b-0">
          <div className="px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white lg:hidden">
                  Welcome back, {user?.name || 'Agent'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 lg:text-base lg:font-medium lg:text-gray-900 lg:dark:text-white">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
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

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} />
              ))}
            </div>
          </div>

          {/* GPS-enabled Task List */}
          <div className="mb-6">
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
      </div>
    </AgentLayout>
  );
};

export default AgentDashboard;
