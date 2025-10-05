'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Assignment {
  id: string;
  type: 'verification' | 'collection' | 'inspection';
  title: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'accepted' | 'rejected' | 'scheduled';
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

interface AssignmentCardProps {
  assignment: Assignment;
  currentLocation: { lat: number; lng: number } | null;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, currentLocation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate distance (simplified calculation)
  const calculateDistance = () => {
    if (!currentLocation) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (assignment.location.coordinates.lat - currentLocation.lat) * Math.PI / 180;
    const dLon = (assignment.location.coordinates.lng - currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(assignment.location.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  const distance = calculateDistance();
  const timeUntilDeadline = new Date(assignment.deadline).getTime() - new Date().getTime();
  const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'verification': return 'bg-blue-500';
      case 'collection': return 'bg-green-500';
      case 'inspection': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      layout
      className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`${getTypeColor(assignment.type)} w-3 h-3 rounded-full mt-2 flex-shrink-0`}></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {assignment.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {assignment.supplier.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.priority)}`}>
              {assignment.priority}
            </span>
            {getStatusIcon(assignment.status)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {distance ? `${distance.toFixed(1)}km away` : 'Location unknown'}
            </div>
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {assignment.estimatedTime}min
            </div>
          </div>
          <ChevronRightIcon 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </div>

        {hoursUntilDeadline < 2 && hoursUntilDeadline > 0 && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ Due in {hoursUntilDeadline}h
          </div>
        )}
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800"
        >
          <div className="space-y-3">
            {/* Location */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.location.address}</p>
            </div>

            {/* Materials */}
            {assignment.materials && assignment.materials.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Materials</h4>
                <div className="space-y-1">
                  {assignment.materials.map((material, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      {material.type}: {material.quantity} {material.unit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(assignment.deadline).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Link
                href={`/agent/verify/${assignment.id}`}
                className="flex-1 bg-agent-DEFAULT text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-agent-DEFAULT/90 transition-colors"
              >
                Start Task
              </Link>
              <a
                href={`tel:${assignment.supplier.contact}`}
                className="flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </a>
              <a
                href={`https://maps.google.com?q=${assignment.location.coordinates.lat},${assignment.location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MapPinIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AssignmentCard;
