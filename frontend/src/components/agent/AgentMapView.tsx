'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPinIcon, TruckIcon, ClockIcon, CurrencyDollarIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Agent {
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  coordinates: Location;
  currentWorkload?: number;
  maxWorkload?: number;
  rating?: number;
  distanceFromMaterial?: number;
  estimatedArrival?: string;
  visitCost?: number;
  status: string;
}

interface VisitCostDetails {
  baseCost: number;
  distanceCost: number;
  timeCost: number;
  urgencySurcharge: number;
  totalCost: number;
  estimatedDuration: number;
  distanceKm: number;
}

interface AgentMapViewProps {
  materialLocation: Location;
  assignedAgent?: Agent;
  onAgentSelect?: (agent: Agent) => void;
  showNearbyAgents?: boolean;
  urgency?: 'high' | 'medium' | 'low';
}

export default function AgentMapView({
  materialLocation,
  assignedAgent,
  onAgentSelect,
  showNearbyAgents = true,
  urgency = 'medium'
}: AgentMapViewProps) {
  const [nearbyAgents, setNearbyAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(assignedAgent || null);
  const [costDetails, setCostDetails] = useState<VisitCostDetails | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: materialLocation.latitude, lng: materialLocation.longitude },
        zoom: 12,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Add material location marker
      new google.maps.Marker({
        position: { lat: materialLocation.latitude, lng: materialLocation.longitude },
        map: map,
        title: 'Material Location',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });
    };

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      initMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [materialLocation]);

  // Fetch nearby agents
  const fetchNearbyAgents = useCallback(async () => {
    if (!showNearbyAgents) return;

    setIsLoadingAgents(true);
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock nearby agents data
      const mockAgents: Agent[] = [
        {
          agentId: 'agent1',
          agentName: 'Kamal Perera',
          agentPhone: '+94 77 123 4567',
          agentEmail: 'kamal@cyclesync.com',
          coordinates: {
            latitude: materialLocation.latitude + 0.01,
            longitude: materialLocation.longitude + 0.01
          },
          currentWorkload: 3,
          maxWorkload: 5,
          rating: 4.5,
          distanceFromMaterial: 5.2,
          status: 'active'
        },
        {
          agentId: 'agent2',
          agentName: 'Nimal Silva',
          agentPhone: '+94 77 234 5678',
          agentEmail: 'nimal@cyclesync.com',
          coordinates: {
            latitude: materialLocation.latitude - 0.02,
            longitude: materialLocation.longitude + 0.015
          },
          currentWorkload: 2,
          maxWorkload: 5,
          rating: 4.8,
          distanceFromMaterial: 8.5,
          status: 'active'
        },
        {
          agentId: 'agent3',
          agentName: 'Sunil Fernando',
          agentPhone: '+94 77 345 6789',
          agentEmail: 'sunil@cyclesync.com',
          coordinates: {
            latitude: materialLocation.latitude + 0.025,
            longitude: materialLocation.longitude - 0.01
          },
          currentWorkload: 4,
          maxWorkload: 5,
          rating: 4.2,
          distanceFromMaterial: 12.3,
          status: 'busy'
        }
      ];

      setNearbyAgents(mockAgents);

      // Add markers for nearby agents
      if (mapInstanceRef.current) {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add new markers
        mockAgents.forEach(agent => {
          const marker = new google.maps.Marker({
            position: { lat: agent.coordinates.latitude, lng: agent.coordinates.longitude },
            map: mapInstanceRef.current!,
            title: agent.agentName,
            icon: {
              url: agent.status === 'active' 
                ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
            }
          });

          marker.addListener('click', () => {
            handleAgentSelection(agent);
          });

          markersRef.current.push(marker);
        });
      }
    } catch (error) {
      console.error('Error fetching nearby agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [materialLocation, showNearbyAgents]);

  useEffect(() => {
    fetchNearbyAgents();
  }, [fetchNearbyAgents]);

  // Calculate and display route
  const displayRoute = useCallback((agent: Agent) => {
    if (!mapInstanceRef.current || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: true
    });

    const request = {
      origin: { lat: agent.coordinates.latitude, lng: agent.coordinates.longitude },
      destination: { lat: materialLocation.latitude, lng: materialLocation.longitude },
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
      }
    });
  }, [materialLocation]);

  // Handle agent selection
  const handleAgentSelection = async (agent: Agent) => {
    setSelectedAgent(agent);
    displayRoute(agent);

    // Fetch cost details
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockCostDetails: VisitCostDetails = {
        baseCost: 500,
        distanceCost: agent.distanceFromMaterial! * 25,
        timeCost: 750,
        urgencySurcharge: urgency === 'high' ? 300 : urgency === 'medium' ? 100 : 0,
        totalCost: 500 + (agent.distanceFromMaterial! * 25) + 750 + (urgency === 'high' ? 300 : 0),
        estimatedDuration: 1.5,
        distanceKm: agent.distanceFromMaterial!
      };

      setCostDetails(mockCostDetails);
    } catch (error) {
      console.error('Error fetching cost details:', error);
    }

    onAgentSelect?.(agent);
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg shadow-lg"
          style={{ minHeight: '400px' }}
        />

        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Material Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Available Agent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Busy Agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      {showNearbyAgents && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Nearby Field Agents
            </h3>
            {isLoadingAgents && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyAgents.map((agent) => (
              <motion.div
                key={agent.agentId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedAgent?.agentId === agent.agentId
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                }`}
                onClick={() => handleAgentSelection(agent)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {agent.agentName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent.distanceFromMaterial?.toFixed(1)} km away
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {agent.agentPhone}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Workload: {agent.currentWorkload}/{agent.maxWorkload}
                  </div>
                  {agent.rating && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-yellow-500 mr-1">★</span>
                      {agent.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Agent Details */}
      <AnimatePresence>
        {selectedAgent && costDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Agent Assignment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Agent Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-gray-900 dark:text-white font-medium">
                      {selectedAgent.agentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {selectedAgent.agentPhone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {selectedAgent.distanceFromMaterial?.toFixed(1)} km
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Estimated Arrival:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(Date.now() + costDetails.estimatedDuration * 60 * 60 * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Visit Cost Estimate
                  </h4>
                  <button
                    onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    {showCostBreakdown ? 'Hide' : 'Show'} Breakdown
                  </button>
                </div>

                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  LKR {costDetails.totalCost.toLocaleString()}
                </div>

                <AnimatePresence>
                  {showCostBreakdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span>LKR {costDetails.baseCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance Cost:</span>
                        <span>LKR {costDetails.distanceCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Cost:</span>
                        <span>LKR {costDetails.timeCost.toLocaleString()}</span>
                      </div>
                      {costDetails.urgencySurcharge > 0 && (
                        <div className="flex justify-between">
                          <span>Urgency Surcharge:</span>
                          <span>LKR {costDetails.urgencySurcharge.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 mt-2 flex justify-between font-medium text-gray-900 dark:text-white">
                        <span>Total:</span>
                        <span>LKR {costDetails.totalCost.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                  <p>This cost will be deducted from your final payment after successful sale.</p>
                </div>
              </div>
            </div>

            {assignedAgent && assignedAgent.agentId === selectedAgent.agentId && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-100">
                      Agent Confirmed
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedAgent.agentName} will visit your location for material verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}