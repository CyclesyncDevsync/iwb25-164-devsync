'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  PhoneIcon,
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
  deadline: string;
}

const AgentMapPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          // Default to Colombo
          setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
        }
      );
    }

    // Mock assignments data
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
          deadline: '2025-08-20T16:30:00Z'
        },
        {
          id: '3',
          type: 'inspection',
          title: 'Paper Waste Inspection',
          location: {
            address: 'Galle, Southern Province',
            coordinates: { lat: 6.0535, lng: 80.2210 }
          },
          priority: 'low',
          status: 'pending',
          estimatedTime: 30,
          supplier: {
            name: 'Paper Solutions Ltd',
            contact: '+94 91 234 5678'
          },
          deadline: '2025-08-21T10:00:00Z'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const calculateDistance = (point1: {lat: number; lng: number}, point2: {lat: number; lng: number}) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const openInMaps = (coordinates: {lat: number; lng: number}) => {
    const url = `https://maps.google.com?q=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
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

        {/* Map Placeholder */}
        <div className="relative h-64 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Interactive Map View</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Would integrate with Google Maps or similar mapping service
              </p>
            </div>
          </div>
          
          {/* GPS Status and Current Location Indicator */}
          {currentLocation && (
            <>
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                📍 GPS Active
              </div>
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                You are here: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </div>
            </>
          )}
        </div>

        {/* Assignment List */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nearby Assignments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {assignments.length} location{assignments.length !== 1 ? 's' : ''} to visit
            </p>
          </div>

          <div className="space-y-3">
            {assignments.map((assignment, index) => {
              const distance = currentLocation 
                ? calculateDistance(currentLocation, assignment.location.coordinates)
                : null;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-dark-surface rounded-lg shadow-sm border p-4 ${
                    selectedAssignment?.id === assignment.id 
                      ? 'border-agent-DEFAULT ring-2 ring-agent-DEFAULT/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedAssignment(
                    selectedAssignment?.id === assignment.id ? null : assignment
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getPriorityColor(assignment.priority)} mt-1`}></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.supplier.name}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      assignment.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {assignment.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {assignment.location.address}
                    </div>
                    {distance && (
                      <div className="text-agent-DEFAULT font-medium">
                        {distance.toFixed(1)}km away
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {assignment.estimatedTime}min
                      </div>
                      <div>
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedAssignment?.id === assignment.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInMaps(assignment.location.coordinates);
                          }}
                          className="flex items-center justify-center py-2 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
                        >
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                          Navigate
                        </button>

                        <a
                          href={`tel:${assignment.supplier.contact}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center py-2 px-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <PhoneIcon className="w-4 h-4 mr-1" />
                          Call
                        </a>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <strong>Coordinates:</strong> {assignment.location.coordinates.lat.toFixed(6)}, {assignment.location.coordinates.lng.toFixed(6)}
                      </div>

                      {/* Deadline Warning */}
                      {new Date(assignment.deadline).getTime() - Date.now() < 2 * 60 * 60 * 1000 && (
                        <div className="mt-2 flex items-center text-red-600 dark:text-red-400 text-xs">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Due soon: {new Date(assignment.deadline).toLocaleString()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-12">
              <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back later for new locations to visit
              </p>
            </div>
          )}
        </div>

        {/* Route Summary */}
        {assignments.length > 0 && currentLocation && (
          <div className="px-4 lg:px-6 mt-6">
            <div className="mx-auto max-w-7xl">
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Today's Route Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-agent-DEFAULT">
                      {assignments.length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Locations</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {assignments.reduce((sum, a) => sum + a.estimatedTime, 0)}m
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Est. Time</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {currentLocation && assignments.length > 0 
                        ? assignments.reduce((total, assignment) => 
                            total + calculateDistance(currentLocation, assignment.location.coordinates), 0
                          ).toFixed(1)
                        : '0'
                      }km
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Distance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AgentLayout>
  );
};

export default AgentMapPage;
