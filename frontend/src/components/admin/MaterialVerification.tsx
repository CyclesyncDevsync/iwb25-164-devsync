'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Fix for default markers
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Dynamically import map component to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then(mod => mod.CircleMarker),
  { ssr: false }
);

// Mock warehouse centers (used when no real data is available)
const WAREHOUSE_CENTERS = [
  {
    id: 'wh-1',
    name: 'Colombo Collection Center',
    address: 'Colombo District Center',
    latitude: 6.9271,
    longitude: 79.8612,
    dropOffRequests: 0, // Will be updated with real data
  },
  {
    id: 'wh-2',
    name: 'Kandy Collection Center',
    address: 'Kandy Distribution Center',
    latitude: 7.2906,
    longitude: 80.6337,
    dropOffRequests: 0, // Will be updated with real data
  },
  {
    id: 'wh-3',
    name: 'Galle Collection Center',
    address: 'Galle Collection Point',
    latitude: 6.0535,
    longitude: 80.2210,
    dropOffRequests: 0, // Will be updated with real data
  },
];

// Mock agents
const DUMMY_AGENTS = [
  { id: 'agent-1', name: 'John Silva', distance: 2.5 },
  { id: 'agent-2', name: 'Maria Fernando', distance: 3.8 },
  { id: 'agent-3', name: 'Kumar Perera', distance: 5.2 },
  { id: 'agent-4', name: 'Sarah Dias', distance: 1.9 },
  { id: 'agent-5', name: 'Ahmed Rashid', distance: 4.3 },
];

interface MaterialSubmission {
  id: string;
  transaction_id: string;
  supplier_id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  delivery_method: 'agent_visit' | 'drop_off';
  submission_status: string;
  created_at: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  selected_warehouse_name?: string;
  selected_warehouse_address?: string;
  supplier_name?: string;
  supplier_email?: string;
  expected_price?: number;
  agent_assigned?: boolean;
  agent_id?: string;
  assigned_agent?: { id: string; name: string; distance: number };
  // Additional fields for detailed view
  description?: string;
  sub_category?: string;
  condition?: string;
  minimum_price?: number;
  negotiable?: boolean;
  location_city?: string;
  location_district?: string;
  location_province?: string;
  material_type?: string;
  material_color?: string;
  material_brand?: string;
  dimension_length?: number;
  dimension_width?: number;
  dimension_height?: number;
  dimension_weight?: number;
  photos?: string[]; // Array of photo URLs
}

interface Agent {
  id: string;
  asgardeo_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
}

export function MaterialVerification() {
  const [submissions, setSubmissions] = useState<MaterialSubmission[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'agent_visit' | 'drop_off'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    agentVisits: 0,
    dropOffs: 0,
    pendingVerifications: 0
  });
  const [warehouses, setWarehouses] = useState(WAREHOUSE_CENTERS);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedSubmissionForAgent, setSelectedSubmissionForAgent] = useState<MaterialSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmissionForDetails, setSelectedSubmissionForDetails] = useState<MaterialSubmission | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState<number | null>(null);
  const [photoAnalysisResults, setPhotoAnalysisResults] = useState<{[key: number]: any}>({});

  useEffect(() => {
    fetchMaterialSubmissions();
    fetchAgents();
    // fetchStatistics(); // Statistics are now calculated from actual data
  }, []);
  
  // Recalculate warehouse stats when submissions change
  useEffect(() => {
    if (submissions.length > 0) {
      fetchWarehouseStats();
    }
  }, [submissions.length]); // Only depend on length to avoid infinite loops


  const fetchMaterialSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch from actual API
      const response = await fetch('http://localhost:8080/api/test/material-submissions', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        console.log('First item:', data.data?.[0]); // Debug log
        console.log('Assigned agent for first item:', data.data?.[0]?.assigned_agent); // Debug agent field
        const apiSubmissions: MaterialSubmission[] = data.data.map((item: any) => ({
          id: item.id,
          transaction_id: item.transaction_id,
          supplier_id: item.supplier_id,
          supplier_name: item.supplier_name,
          supplier_email: item.supplier_email,
          title: item.title,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          delivery_method: item.delivery_method,
          submission_status: item.submission_status,
          created_at: item.created_at,
          location_latitude: item.location_latitude,
          location_longitude: item.location_longitude,
          location_address: item.location_address,
          selected_warehouse_name: item.selected_warehouse_name,
          selected_warehouse_address: item.selected_warehouse_address,
          expected_price: item.expected_price,
          agent_assigned: item.assigned_agent ? true : false,
          agent_id: item.assigned_agent?.id,
          assigned_agent: item.assigned_agent ? {
            id: item.assigned_agent.id,
            name: item.assigned_agent.name,
            distance: Math.random() * 5 + 1 // Mock distance
          } : undefined,
          // Additional fields for detailed view
          description: item.description,
          sub_category: item.sub_category,
          condition: item.condition,
          minimum_price: item.minimum_price,
          negotiable: item.negotiable,
          location_city: item.location_city,
          location_district: item.location_district,
          location_province: item.location_province,
          material_type: item.material_type,
          material_color: item.material_color,
          material_brand: item.material_brand,
          dimension_length: item.dimension_length,
          dimension_width: item.dimension_width,
          dimension_height: item.dimension_height,
          dimension_weight: item.dimension_weight,
          photos: (() => {
            if (!item.photos) return [];
            
            // Handle different photo formats
            if (Array.isArray(item.photos)) {
              return item.photos.map(photo => {
                // If photo is an object with 'data' property, extract it
                if (typeof photo === 'object' && photo.data) {
                  return photo.data;
                }
                return photo;
              });
            }
            
            // If photos is a string, try to parse it
            if (typeof item.photos === 'string') {
              try {
                const parsed = JSON.parse(item.photos);
                if (Array.isArray(parsed)) {
                  return parsed.map(p => p.data || p);
                }
                return [parsed.data || parsed];
              } catch (e) {
                // If parsing fails, treat as single photo URL
                return [item.photos];
              }
            }
            
            return [];
          })(),
        }));
        setSubmissions(apiSubmissions);
        console.log('Processed submissions:', apiSubmissions); // Debug log
        
        // Log agent visit locations
        const agentVisits = apiSubmissions.filter(s => s.delivery_method === 'agent_visit');
        console.log('Agent visits with locations:', agentVisits.map(s => ({
          id: s.id,
          title: s.title,
          lat: s.location_latitude,
          lng: s.location_longitude,
          address: s.location_address
        })));
        
        // Log drop-off warehouses
        const dropOffs = apiSubmissions.filter(s => s.delivery_method === 'drop_off');
        console.log('Drop-off warehouses:', dropOffs.map(s => ({
          id: s.id,
          title: s.title,
          warehouse: s.selected_warehouse_name,
          address: s.selected_warehouse_address
        })));
        
        // Calculate statistics from the actual data
        const stats = {
          totalSubmissions: apiSubmissions.length,
          agentVisits: apiSubmissions.filter(s => s.delivery_method === 'agent_visit').length,
          dropOffs: apiSubmissions.filter(s => s.delivery_method === 'drop_off').length,
          pendingVerifications: apiSubmissions.filter(s => s.submission_status === 'pending_verification').length
        };
        console.log('Calculated stats:', stats); // Debug log
        setStatistics(stats);
      } else {
        console.log('API Response not OK:', response.status, response.statusText); // Debug log
        // Fallback to mock data if API fails
        
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      // Fallback to empty array on error
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (selectedFilter === 'all') return true;
    return sub.delivery_method === selectedFilter;
  });

  const agentVisitSubmissions = filteredSubmissions.filter(sub => sub.delivery_method === 'agent_visit');
  const dropOffSubmissions = filteredSubmissions.filter(sub => sub.delivery_method === 'drop_off');
  
  // Update map center based on available data
  useEffect(() => {
    if (agentVisitSubmissions.length > 0) {
      const validLocations = agentVisitSubmissions.filter(s => s.location_latitude && s.location_longitude);
      if (validLocations.length > 0) {
        const firstLocation = validLocations[0];
        setMapCenter([firstLocation.location_latitude!, firstLocation.location_longitude!]);
      }
    }
  }, [selectedFilter]); // Only update when filter changes, not on every render

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending_verification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      verified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending_verification}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/material-submissions/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/test/users', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter only users with AGENT role (case-insensitive)
        const agentUsers = data.data.filter((user: any) => user.role?.toLowerCase() === 'agent');
        const processedAgents: Agent[] = agentUsers.map((user: any) => ({
          id: user.id,
          asgardeo_id: user.asgardeo_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: user.status,
        }));
        setAgents(processedAgents);
        console.log('Available agents:', processedAgents);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchWarehouseStats = () => {
    try {
      // Calculate warehouse stats from actual submissions
      const warehouseMap = new Map<string, any>();
      
      const dropOffs = submissions.filter(s => s.delivery_method === 'drop_off');
      console.log('Drop-off submissions for warehouse calculation:', dropOffs.length);
      
      dropOffs.forEach(submission => {
        console.log('Processing submission:', {
          id: submission.id,
          warehouse_name: submission.selected_warehouse_name,
          warehouse_address: submission.selected_warehouse_address
        });
        
        if (submission.selected_warehouse_name) {
          const key = submission.selected_warehouse_name;
          if (!warehouseMap.has(key)) {
            // Find matching warehouse center for coordinates
            const matchingCenter = WAREHOUSE_CENTERS.find(w => w.name === key);
            warehouseMap.set(key, {
              id: `wh-${key.toLowerCase().replace(/\s+/g, '-')}`,
              name: submission.selected_warehouse_name,
              address: submission.selected_warehouse_address || 'Unknown Address',
              latitude: matchingCenter?.latitude || 6.9271,
              longitude: matchingCenter?.longitude || 79.8612,
              dropOffRequests: 0
            });
          }
          const warehouse = warehouseMap.get(key);
          warehouse.dropOffRequests++;
        }
      });
      
      const calculatedWarehouses = Array.from(warehouseMap.values());
      
      // Start with all warehouse centers
      const allWarehouses = WAREHOUSE_CENTERS.map(center => ({
        ...center,
        dropOffRequests: 0 // Initialize with 0
      }));
      
      // Update counts for warehouses that have submissions
      calculatedWarehouses.forEach(calcWarehouse => {
        const index = allWarehouses.findIndex(w => w.name === calcWarehouse.name);
        if (index !== -1) {
          allWarehouses[index].dropOffRequests = calcWarehouse.dropOffRequests;
        }
      });
      
      console.log('All warehouses with counts:', allWarehouses);
      setWarehouses(allWarehouses);
    } catch (error) {
      console.error('Failed to calculate warehouse stats:', error);
      // Keep default warehouses on error
    }
  };

  const openAgentModal = (submission: MaterialSubmission) => {
    setSelectedSubmissionForAgent(submission);
    setShowAgentModal(true);
  };

  const assignAgent = async (agentId: string, e?: React.MouseEvent) => {
    // Prevent any default behavior that might cause page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Assigning agent:', agentId);
    if (!selectedSubmissionForAgent) {
      console.log('No submission selected');
      return;
    }

    const selectedAgent = agents.find(a => a.asgardeo_id === agentId);
    if (!selectedAgent) {
      console.log('Agent not found');
      return;
    }
    console.log('Selected agent:', selectedAgent);

    try {
      console.log('Assigning agent via backend API:', {
        submissionId: selectedSubmissionForAgent.id,
        agentId: selectedAgent.asgardeo_id
      });
      
      // Call through Next.js API route - the route will handle authentication
      // using the HTTP-only cookie containing the ID token
      const response = await fetch('/api/test-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: selectedSubmissionForAgent.id,
          agentAsgardeoId: selectedAgent.asgardeo_id,
          assignedBy: 'admin',
          notes: `Material submission #${selectedSubmissionForAgent.id} assigned by admin`,
          location: {
            latitude: selectedSubmissionForAgent.location_latitude || 6.9271,
            longitude: selectedSubmissionForAgent.location_longitude || 79.8612,
            address: selectedSubmissionForAgent.location_address || 'Unknown location'
          }
        })
      });

      if (response.ok) {
        const assignmentData = await response.json();
        console.log('Assignment successful:', assignmentData);
        
        // Update local state with assigned agent
        const updatedSubmissions = submissions.map(sub => {
          if (sub.id === selectedSubmissionForAgent.id) {
            return { 
              ...sub, 
              assigned_agent: {
                id: selectedAgent.asgardeo_id,
                name: `${selectedAgent.first_name} ${selectedAgent.last_name}`,
                distance: Math.random() * 5 + 1 // Mock distance since we don't have it in the response
              },
              submission_status: 'assigned',
              agent_assigned: true,
              agent_id: selectedAgent.asgardeo_id
            };
          }
          return sub;
        });
        setSubmissions(updatedSubmissions);
        setShowAgentModal(false);
        
        // Show success toast message
        toast.success(
          `Agent ${selectedAgent.first_name} ${selectedAgent.last_name} assigned successfully!`,
          {
            duration: 4000,
            position: 'top-right',
            icon: '✅',
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '500',
            },
          }
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API response not OK:', response.status, errorData);
        toast.error('Failed to assign agent. Please try again.', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Failed to assign agent:', error);
      toast.error('Failed to assign agent. Please check your connection and try again.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const viewDetails = (submission: MaterialSubmission) => {
    setSelectedSubmissionForDetails(submission);
    setShowDetailsModal(true);
    setPhotoAnalysisResults({}); // Reset analysis results when opening new details
  };

  const analyzePhoto = async (photo: string, index: number) => {
    if (!selectedSubmissionForDetails) return;
    
    setAnalyzingPhoto(index);
    
    try {
      // Extract base64 data from data URL
      const base64Data = photo.split(',')[1] || photo;
      
      // Determine image format from data URL
      let imageFormat = 'jpeg'; // default
      if (photo.includes('data:image/')) {
        const match = photo.match(/data:image\/(\w+);/);
        if (match) {
          imageFormat = match[1].toLowerCase();
          // Handle jpg as jpeg
          if (imageFormat === 'jpg') imageFormat = 'jpeg';
        }
      }
      
      const analysisRequest = {
        wasteStreamId: selectedSubmissionForDetails.id.toString(),
        wasteType: selectedSubmissionForDetails.category || 'plastic', // Use a valid waste type
        location: selectedSubmissionForDetails.location_city || 'Unknown',
        fieldAgentId: selectedSubmissionForDetails.assigned_agent?.id?.toString() || 'unassigned',
        imageData: base64Data,
        imageFormat: imageFormat,
        fileName: `material_${selectedSubmissionForDetails.id}_photo_${index}.${imageFormat}`,
        metadata: {
          submissionId: selectedSubmissionForDetails.id.toString(),
          supplierId: selectedSubmissionForDetails.supplier_id,
          deliveryMethod: selectedSubmissionForDetails.delivery_method,
          materialType: selectedSubmissionForDetails.category || 'Unknown',
          expectedCategory: selectedSubmissionForDetails.category || 'Unknown'
        }
      };
      
      console.log('Sending image for AI analysis...');
      console.log('Analysis request:', {
        ...analysisRequest,
        imageData: analysisRequest.imageData.substring(0, 50) + '...' // Log truncated for brevity
      });
      
      const response = await fetch('http://localhost:8082/api/ai/quality/assess-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisRequest)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('AI Analysis Result:', result);
        
        setPhotoAnalysisResults(prev => ({
          ...prev,
          [index]: result
        }));
      } else {
        let errorMessage = 'Analysis failed';
        try {
          const errorData = await response.json();
          console.error('AI Analysis failed:', response.status, errorData);
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status} error`;
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `HTTP ${response.status} error`;
        }
        setPhotoAnalysisResults(prev => ({
          ...prev,
          [index]: { error: errorMessage, status: response.status }
        }));
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      setPhotoAnalysisResults(prev => ({
        ...prev,
        [index]: { error: 'Analysis error', message: error.message }
      }));
    } finally {
      setAnalyzingPhoto(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Material Verification Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage material submissions from suppliers
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalSubmissions}</p>
              )}
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agent Visits</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.agentVisits}</p>
              )}
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Drop-off Requests</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.dropOffs}</p>
              )}
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setSelectedFilter('agent_visit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFilter === 'agent_visit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Agent Visits
          </button>
          <button
            onClick={() => setSelectedFilter('drop_off')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFilter === 'drop_off'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Drop-offs
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Material Collection Locations
        </h2>
        <div className="h-[400px] rounded-lg overflow-hidden">
          <MapContainer 
            key="material-verification-map"
            center={mapCenter} 
            zoom={8} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Warehouse Centers */}
            {warehouses.map(warehouse => (
              <Marker
                key={warehouse.id}
                position={[warehouse.latitude, warehouse.longitude]}
                eventHandlers={{
                  click: () => setSelectedWarehouse(warehouse.id),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{warehouse.name}</h3>
                    <p className="text-sm text-gray-600">{warehouse.address}</p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">{warehouse.dropOffRequests}</span> drop-off requests
                      {warehouse.dropOffRequests === 0 && (
                        <span className="text-xs text-gray-500 block">(No submissions yet)</span>
                      )}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Agent Visit Locations */}
            {agentVisitSubmissions.map(submission => {
              // Only render if we have valid coordinates
              if (submission.location_latitude && submission.location_longitude) {
                return (
                  <CircleMarker
                    key={submission.id}
                    center={[submission.location_latitude, submission.location_longitude]}
                    radius={8}
                    fillColor="#10B981"
                    color="#10B981"
                    weight={2}
                    opacity={1}
                    fillOpacity={0.8}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{submission.title}</h3>
                        <p className="text-sm text-gray-600">{submission.supplier_name}</p>
                        <p className="text-sm text-gray-600">{submission.location_address}</p>
                        <p className="text-sm mt-2">
                          Quantity: <span className="font-medium">{submission.quantity} {submission.unit}</span>
                        </p>
                        {submission.assigned_agent && (
                          <p className="text-sm">
                            Agent: <span className="font-medium">{submission.assigned_agent.name}</span>
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Submissions
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} entries
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Delivery Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(submission => (
                <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{submission.supplier_name || 'Unknown Supplier'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="font-medium">{submission.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {submission.quantity} {submission.unit} • {submission.category}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      {submission.delivery_method === 'agent_visit' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Agent Visit
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                          Drop-off
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission.submission_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {submission.assigned_agent ? (
                      <div className="flex items-center justify-between group">
                        <div className="flex-1">
                          <p className="font-medium">{submission.assigned_agent.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {submission.delivery_method === 'agent_visit' 
                              ? `${submission.assigned_agent.distance.toFixed(1)} km away`
                              : 'Coordinator'}
                          </p>
                        </div>
                        <button
                          onClick={() => openAgentModal(submission)}
                          className="ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Change agent"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAgentModal(submission)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Assign Agent
                      </button>
                    )
                  }</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => viewDetails(submission)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSubmissions.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredSubmissions.length / itemsPerPage)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.ceil(filteredSubmissions.length / itemsPerPage) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredSubmissions.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredSubmissions.length / itemsPerPage)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Assignment Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedSubmissionForAgent?.assigned_agent ? 'Change Agent Assignment' : 'Assign Agent'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Material: <span className="font-medium">{selectedSubmissionForAgent?.title}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Delivery: <span className="font-medium">
                  {selectedSubmissionForAgent?.delivery_method === 'agent_visit' ? 'Agent Visit' : 'Drop-off at Warehouse'}
                </span>
              </p>
              {selectedSubmissionForAgent?.delivery_method === 'drop_off' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Agent will coordinate with supplier for drop-off logistics
                </p>
              )}
              {selectedSubmissionForAgent?.assigned_agent && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Currently assigned to: <span className="font-medium">{selectedSubmissionForAgent.assigned_agent.name}</span>
                </p>
              )}
            </div>
            
            <div className="p-6">
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    No agents available in the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={(e) => assignAgent(agent.asgardeo_id, e)}
                      className={`relative flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                        selectedSubmissionForAgent?.assigned_agent?.id === agent.asgardeo_id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {agent.first_name.charAt(0)}{agent.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {agent.first_name} {agent.last_name}
                          {selectedSubmissionForAgent?.assigned_agent?.id === agent.asgardeo_id && (
                            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.email}
                        </div>
                      </div>
                      {agent.status === 'approved' && (
                        <div className="flex-shrink-0 ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end">
              <button
                onClick={() => setShowAgentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Details Modal */}
      {showDetailsModal && selectedSubmissionForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Material Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Transaction ID:</span> <span className="font-medium">{selectedSubmissionForDetails.transaction_id}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Title:</span> <span className="font-medium">{selectedSubmissionForDetails.title}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Category:</span> <span className="font-medium">{selectedSubmissionForDetails.category}</span></p>
                  {selectedSubmissionForDetails.sub_category && (
                    <p className="text-sm"><span className="text-gray-500">Sub-category:</span> <span className="font-medium">{selectedSubmissionForDetails.sub_category}</span></p>
                  )}
                  <p className="text-sm"><span className="text-gray-500">Quantity:</span> <span className="font-medium">{selectedSubmissionForDetails.quantity} {selectedSubmissionForDetails.unit}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Status:</span> {getStatusBadge(selectedSubmissionForDetails.submission_status)}</p>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Supplier Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Name:</span> <span className="font-medium">{selectedSubmissionForDetails.supplier_name || 'Unknown'}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedSubmissionForDetails.supplier_email || 'N/A'}</span></p>
                  <p className="text-sm"><span className="text-gray-500">Supplier ID:</span> <span className="font-medium">{selectedSubmissionForDetails.supplier_id}</span></p>
                </div>
              </div>

              {/* Material Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Material Details</h3>
                <div className="space-y-2">
                  {selectedSubmissionForDetails.description && (
                    <p className="text-sm"><span className="text-gray-500">Description:</span> <span className="font-medium">{selectedSubmissionForDetails.description}</span></p>
                  )}
                  {selectedSubmissionForDetails.material_type && (
                    <p className="text-sm"><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedSubmissionForDetails.material_type}</span></p>
                  )}
                  {selectedSubmissionForDetails.material_color && (
                    <p className="text-sm"><span className="text-gray-500">Color:</span> <span className="font-medium">{selectedSubmissionForDetails.material_color}</span></p>
                  )}
                  {selectedSubmissionForDetails.material_brand && (
                    <p className="text-sm"><span className="text-gray-500">Brand:</span> <span className="font-medium">{selectedSubmissionForDetails.material_brand}</span></p>
                  )}
                  {selectedSubmissionForDetails.condition && (
                    <p className="text-sm"><span className="text-gray-500">Condition:</span> <span className="font-medium">{selectedSubmissionForDetails.condition}</span></p>
                  )}
                </div>
              </div>

              {/* Material Photos */}
              {selectedSubmissionForDetails.photos && Array.isArray(selectedSubmissionForDetails.photos) && selectedSubmissionForDetails.photos.length > 0 && (
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedSubmissionForDetails.photos.map((photo, index) => {
                      // Photo should now be a proper data URL or regular URL
                      const photoUrl = photo;
                      console.log('Displaying photo:', index, photoUrl.substring(0, 50) + '...'); // Debug log
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex gap-2">
                            <div className="relative group flex-1">
                              <img
                                src={photoUrl}
                                alt={`Material photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  console.error('Failed to load image:', photoUrl);
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=';
                                }}
                              />
                              <button
                                onClick={() => window.open(photoUrl, '_blank')}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                title="View full size"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => analyzePhoto(photo, index)}
                              disabled={analyzingPhoto === index}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium flex items-center gap-2 self-start"
                              title="AI Analysis"
                            >
                              {analyzingPhoto === index ? (
                                <>
                                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  <span>Analyze</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* AI Analysis Results */}
                          {photoAnalysisResults[index] && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-3">
                              {photoAnalysisResults[index].error ? (
                                <p className="text-red-600 dark:text-red-400 text-sm">
                                  Analysis Error: {photoAnalysisResults[index].error || 'Failed to analyze image'}
                                </p>
                              ) : (
                                <>
                                  {/* Material Type Comparison */}
                                  <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                      {/* Use materialTypeMatches if available, otherwise fall back to previous logic */}
                                      {(photoAnalysisResults[index].qualityFactors?.sorting?.materialTypeMatches === true || 
                                        (photoAnalysisResults[index].qualityFactors?.sorting?.materialTypeMatches === undefined && 
                                         (photoAnalysisResults[index].qualityFactors?.sorting?.accuracyScore >= 50 || 
                                          photoAnalysisResults[index].qualityFactors?.sorting?.correctCategory))) ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      <div className="flex-1">
                                        {/* Use the comparison message if available */}
                                        {photoAnalysisResults[index].qualityFactors?.sorting?.comparisonMessage ? (
                                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {photoAnalysisResults[index].qualityFactors.sorting.comparisonMessage}
                                          </p>
                                        ) : (
                                          // Fallback to the old display logic
                                          <p className="text-sm">
                                            {(photoAnalysisResults[index].qualityFactors?.sorting?.accuracyScore >= 50 || 
                                              photoAnalysisResults[index].qualityFactors?.sorting?.correctCategory) ? (
                                              <span className="text-green-700 dark:text-green-300 font-medium">
                                                Material type verified! The image shows <strong className="capitalize">{photoAnalysisResults[index].qualityFactors?.sorting?.detectedType || selectedSubmissionForDetails.category}</strong> material.
                                              </span>
                                            ) : (
                                              <span className="text-red-700 dark:text-red-300 font-medium">
                                                Material type mismatch! User declared <strong className="capitalize">{selectedSubmissionForDetails.category}</strong>
                                                {photoAnalysisResults[index].qualityFactors?.sorting?.detectedType && (
                                                  <>, but image shows <strong className="capitalize">{photoAnalysisResults[index].qualityFactors.sorting.detectedType}</strong></>
                                                )}
                                              </span>
                                            )}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Additional Analysis Details */}
                                    {photoAnalysisResults[index].qualityFactors && (
                                      <div className="mt-2 pl-7 space-y-1">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          Quality Score: <span className="font-medium">{photoAnalysisResults[index].overallScore?.toFixed(1) || 'N/A'}/100</span>
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          Detection Confidence: <span className="font-medium">{((photoAnalysisResults[index].qualityFactors?.sorting?.categoryConfidence || 0) * 100).toFixed(0)}%</span>
                                        </p>
                                        {photoAnalysisResults[index].qualityFactors?.contamination?.contaminants?.length > 0 && (
                                          <p className="text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ Contaminants detected: {photoAnalysisResults[index].qualityFactors.contamination.contaminants.join(', ')}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                  })}
                  </div>
                </div>
              )}

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-500">Delivery Method:</span> <span className="font-medium">{selectedSubmissionForDetails.delivery_method === 'agent_visit' ? 'Agent Visit' : 'Drop-off'}</span></p>
                  {selectedSubmissionForDetails.delivery_method === 'agent_visit' ? (
                    <>
                      <p className="text-sm"><span className="text-gray-500">Address:</span> <span className="font-medium">{selectedSubmissionForDetails.location_address || 'N/A'}</span></p>
                      <p className="text-sm"><span className="text-gray-500">City:</span> <span className="font-medium">{selectedSubmissionForDetails.location_city || 'N/A'}</span></p>
                      <p className="text-sm"><span className="text-gray-500">District:</span> <span className="font-medium">{selectedSubmissionForDetails.location_district || 'N/A'}</span></p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm"><span className="text-gray-500">Warehouse:</span> <span className="font-medium">{selectedSubmissionForDetails.selected_warehouse_name || 'N/A'}</span></p>
                      <p className="text-sm"><span className="text-gray-500">Warehouse Address:</span> <span className="font-medium">{selectedSubmissionForDetails.selected_warehouse_address || 'N/A'}</span></p>
                    </>
                  )}
                </div>
              </div>

              {/* Dimensions (if available) */}
              {(selectedSubmissionForDetails.dimension_length || selectedSubmissionForDetails.dimension_width || selectedSubmissionForDetails.dimension_height || selectedSubmissionForDetails.dimension_weight) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dimensions</h3>
                  <div className="space-y-2">
                    {selectedSubmissionForDetails.dimension_length && (
                      <p className="text-sm"><span className="text-gray-500">Length:</span> <span className="font-medium">{selectedSubmissionForDetails.dimension_length} cm</span></p>
                    )}
                    {selectedSubmissionForDetails.dimension_width && (
                      <p className="text-sm"><span className="text-gray-500">Width:</span> <span className="font-medium">{selectedSubmissionForDetails.dimension_width} cm</span></p>
                    )}
                    {selectedSubmissionForDetails.dimension_height && (
                      <p className="text-sm"><span className="text-gray-500">Height:</span> <span className="font-medium">{selectedSubmissionForDetails.dimension_height} cm</span></p>
                    )}
                    {selectedSubmissionForDetails.dimension_weight && (
                      <p className="text-sm"><span className="text-gray-500">Weight:</span> <span className="font-medium">{selectedSubmissionForDetails.dimension_weight} kg</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Agent Assignment */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Agent Assignment</h3>
                <div className="space-y-2">
                  {selectedSubmissionForDetails.assigned_agent ? (
                    <>
                      <p className="text-sm"><span className="text-gray-500">Agent:</span> <span className="font-medium">{selectedSubmissionForDetails.assigned_agent.name}</span></p>
                      <p className="text-sm"><span className="text-gray-500">Role:</span> <span className="font-medium">
                        {selectedSubmissionForDetails.delivery_method === 'agent_visit' 
                          ? `Field Agent (${selectedSubmissionForDetails.assigned_agent.distance.toFixed(1)} km away)`
                          : 'Coordination Agent'}
                      </span></p>
                      {selectedSubmissionForDetails.delivery_method === 'drop_off' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          Agent will coordinate drop-off logistics with the supplier
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No agent assigned yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Submitted on: {format(new Date(selectedSubmissionForDetails.created_at), 'PPP')} at {format(new Date(selectedSubmissionForDetails.created_at), 'p')}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}