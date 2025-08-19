'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';

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

interface GPSTaskListProps {
  assignments: Assignment[];
  currentLocation: { lat: number; lng: number } | null;
  onAssignmentUpdate: (assignments: Assignment[]) => void;
}

const GPSTaskList: React.FC<GPSTaskListProps> = ({ 
  assignments, 
  currentLocation, 
  onAssignmentUpdate 
}) => {
  const [sortedAssignments, setSortedAssignments] = useState<Assignment[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'priority' | 'deadline'>('distance');

  // Calculate distance between two coordinates
  const calculateDistance = (coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sort assignments based on selected criteria
  useEffect(() => {
    let sorted = [...assignments];

    switch (sortBy) {
      case 'distance':
        if (currentLocation) {
          sorted.sort((a, b) => {
            const distanceA = calculateDistance(currentLocation, a.location.coordinates);
            const distanceB = calculateDistance(currentLocation, b.location.coordinates);
            return distanceA - distanceB;
          });
        }
        break;
      case 'priority':
        sorted.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        break;
      case 'deadline':
        sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }

    setSortedAssignments(sorted);
  }, [assignments, currentLocation, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getOptimalRoute = () => {
    // Simple greedy algorithm for demonstration
    // In production, use a proper routing service
    if (!currentLocation || assignments.length === 0) return assignments;

    const unvisited = [...assignments.filter(a => a.status === 'pending')];
    const route: Assignment[] = [];
    let current = currentLocation;

    while (unvisited.length > 0) {
      // Find nearest unvisited assignment
      let nearestIndex = 0;
      let nearestDistance = calculateDistance(current, unvisited[0].location.coordinates);

      for (let i = 1; i < unvisited.length; i++) {
        const distance = calculateDistance(current, unvisited[i].location.coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = unvisited.splice(nearestIndex, 1)[0];
      route.push(nearest);
      current = nearest.location.coordinates;
    }

    return route;
  };

  const optimizedRoute = getOptimalRoute();
  const totalDistance = optimizedRoute.reduce((total, assignment, index) => {
    if (index === 0 && currentLocation) {
      return total + calculateDistance(currentLocation, assignment.location.coordinates);
    } else if (index > 0) {
      return total + calculateDistance(
        optimizedRoute[index - 1].location.coordinates,
        assignment.location.coordinates
      );
    }
    return total;
  }, 0);

  const totalTime = optimizedRoute.reduce((total, assignment) => total + assignment.estimatedTime, 0);

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'priority' | 'deadline')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
          >
            <option value="distance">Distance</option>
            <option value="priority">Priority</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
        
        {currentLocation && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <MapPinIcon className="w-4 h-4 inline mr-1" />
            GPS Active
          </div>
        )}
      </div>

      {/* Route Summary */}
      {optimizedRoute.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Optimized Route
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {totalDistance.toFixed(1)}km • {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </div>
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {sortedAssignments.map((assignment, index) => {
          const distance = currentLocation 
            ? calculateDistance(currentLocation, assignment.location.coordinates)
            : null;
          
          const isOptimal = optimizedRoute.findIndex(a => a.id === assignment.id);
          
          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${
                isOptimal !== -1 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isOptimal !== -1 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {isOptimal + 1}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {assignment.location.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-xs">
                  {distance && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {distance.toFixed(1)}km
                    </span>
                  )}
                  <span className={`font-medium ${getPriorityColor(assignment.priority)}`}>
                    {assignment.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {assignment.estimatedTime}min
                  </span>
                  <span>
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : assignment.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {assignment.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MapPinIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No assignments available</p>
        </div>
      )}
    </div>
  );
};

export default GPSTaskList;
