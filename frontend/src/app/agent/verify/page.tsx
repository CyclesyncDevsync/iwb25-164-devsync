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
  EyeIcon,
  PhotoIcon,
  SparklesIcon
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
    deliveryMethod?: string;
  };
  materialLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos?: any[];
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  urgency: 'high' | 'medium' | 'low';
  createdAt: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTime: number;
  notes?: string;
}

type TabType = 'pending' | 'in-progress' | 'completed';

const VerifyPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState<Assignment | null>(null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState<string | null>(null);
  const [photoAnalysisResults, setPhotoAnalysisResults] = useState<{[key: string]: any}>({});

  const fetchAssignments = async () => {
    setIsLoading(true); // Ensure loading is set to true at the start
    const userId = user?.asgardeoId || user?.asgardeo_id;
    console.log('Current user ID:', userId);
    console.log('User object:', user);
    
    if (!userId) {
      console.log('No user ID available');
      setIsLoading(false);
      return;
    }

    try {
      // First get the token through the API route
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        console.error('Failed to get auth token');
        setIsLoading(false);
        return;
      }
      
      const authData = await authResponse.json();
      const idToken = authData.idToken;
      
      const response = await fetch(`/backend/agent/${userId}/assignments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        if (data.assignments) {
          console.log('First assignment raw data:', data.assignments[0]);
          // Transform backend data to match new interface
          const transformedAssignments = data.assignments.map((assignment: any) => ({
            id: assignment.assignment_id || assignment.id,
            assignmentId: assignment.assignment_id || assignment.id,
            materialId: assignment.material_id || assignment.id,
            supplierId: assignment.supplier_id,
            supplierName: assignment.supplier_name || 'Unknown Supplier',
            supplierEmail: assignment.supplier_email,
            transactionId: assignment.transaction_id,
            workflowId: assignment.workflow_id,
            submissionId: assignment.submission_id,
            materialDetails: {
              title: assignment.title || 'Material Submission',
              type: assignment.material_type || 'Material',
              subCategory: assignment.sub_category,
              quantity: parseFloat(assignment.quantity) || 1,
              unit: assignment.unit || 'kg',
              condition: assignment.condition || 'good',
              description: assignment.description || 'No description',
              expectedPrice: parseFloat(assignment.expected_price) || 0,
              minimumPrice: parseFloat(assignment.minimum_price) || 0,
              negotiable: assignment.negotiable || false,
              deliveryMethod: assignment.delivery_method || 'agent_visit',
              materialType: assignment.material_type,
              color: assignment.material_color,
              brand: assignment.material_brand,
              model: assignment.material_model,
              manufacturingYear: assignment.manufacturing_year,
              dimensions: {
                length: assignment.dimension_length,
                width: assignment.dimension_width,
                height: assignment.dimension_height,
                weight: assignment.dimension_weight
              },
            },
            materialLocation: {
              latitude: assignment.location_latitude || 6.9271,
              longitude: assignment.location_longitude || 79.8612,
              address: assignment.location_address || 'Address not specified',
              city: assignment.location_city,
              district: assignment.location_district,
              province: assignment.location_province,
              postalCode: assignment.location_postal_code,
            },
            location: {
              address: assignment.location_address,
              city: assignment.location_city,
              district: assignment.location_district,
              province: assignment.location_province,
              postalCode: assignment.location_postal_code,
              latitude: assignment.location_latitude,
              longitude: assignment.location_longitude,
            },
            warehouse: {
              name: assignment.selected_warehouse_name,
              address: assignment.selected_warehouse_address,
              phone: assignment.selected_warehouse_phone,
            },
            photos: (() => {
              if (!assignment.photos) return [];
              
              // Handle different photo formats
              if (Array.isArray(assignment.photos)) {
                return assignment.photos.map(photo => {
                  // If photo is an object with 'data' property, extract it
                  if (typeof photo === 'object' && photo.data) {
                    return photo.data;
                  }
                  return photo;
                });
              }
              
              // If photos is a string, try to parse it
              if (typeof assignment.photos === 'string') {
                try {
                  const parsed = JSON.parse(assignment.photos);
                  if (Array.isArray(parsed)) {
                    return parsed.map(p => p.data || p);
                  }
                } catch (e) {
                  console.error('Failed to parse photos:', e);
                }
              }
              
              return [];
            })(),
            tags: assignment.tags || [],
            status: (assignment.assignment_status === 'assigned' || assignment.submission_status === 'assigned') ? 'pending' : 
                    (assignment.assignment_status === 'in_progress' || assignment.submission_status === 'in_progress') ? 'in-progress' :
                    (assignment.assignment_status === 'completed' || assignment.submission_status === 'completed') ? 'completed' :
                    assignment.assignment_status || assignment.submission_status || 'pending',
            urgency: assignment.urgency || 'medium',
            createdAt: assignment.created_at || new Date().toISOString(),
            assignedAt: assignment.assigned_at || new Date().toISOString(),
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            estimatedTime: 45,
            notes: assignment.notes,
            verificationDate: assignment.verification_date,
            agentId: assignment.agent_id,
            category: assignment.category,
            subCategory: assignment.sub_category,
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
      // Get the auth token first
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        console.error('Failed to get auth token');
        setActionLoading(null);
        return;
      }
      
      const authData = await authResponse.json();
      const idToken = authData.idToken;
      
      // Find the assignment to get the material ID
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        console.error('Assignment not found');
        setActionLoading(null);
        return;
      }
      
      // Update the submission status in the backend
      const response = await fetch(`/backend/material-submissions/${assignment.materialId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          submission_status: newStatus === 'in-progress' ? 'in_progress' : newStatus,
          additional_details: JSON.stringify({
            ...additionalData,
            updatedBy: authData.userId || authData.sub
          })
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
      case 'in-progress':
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

  const analyzePhoto = async (assignmentId: string, photoUrl: string, idx: number) => {
    setAnalyzingPhoto(`${assignmentId}-${idx}`);
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    // Extract base64 data from data URL
    const base64Data = photoUrl.split(',')[1] || photoUrl;
    
    // Determine image format from data URL
    let imageFormat = 'jpeg'; // default
    if (photoUrl.includes('data:image/')) {
      const match = photoUrl.match(/data:image\/(\w+);/);
      if (match) {
        imageFormat = match[1].toLowerCase();
        // Handle jpg as jpeg
        if (imageFormat === 'jpg') imageFormat = 'jpeg';
      }
    }
    
    const analysisRequest = {
      wasteStreamId: assignment.id.toString(),
      wasteType: assignment.category || 'plastic', // Use a valid waste type
      location: assignment.materialLocation.address || 'Unknown',
      fieldAgentId: assignment.agentId || 'unassigned',
      imageData: base64Data,
      imageFormat: imageFormat,
      fileName: `material_${assignment.id}_photo_${idx}.${imageFormat}`,
      metadata: {
        submissionId: assignment.id.toString(),
        supplierId: assignment.supplierId,
        deliveryMethod: assignment.materialDetails.deliveryMethod || 'agent_visit',
        materialType: assignment.materialDetails.type || 'Unknown',
        expectedCategory: assignment.category || 'Unknown'
      }
    };
    
    try {
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
          [`${assignmentId}-${idx}`]: result
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
          [`${assignmentId}-${idx}`]: { error: errorMessage, status: response.status }
        }));
      }
    } catch (error) {
      console.error('Error analyzing photo:', error);
      setPhotoAnalysisResults(prev => ({
        ...prev,
        [`${assignmentId}-${idx}`]: { error: 'Analysis error', message: error.message }
      }));
    } finally {
      setAnalyzingPhoto(null);
    }
  };

  const tabs = [
    { key: 'pending' as TabType, label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
    { key: 'in-progress' as TabType, label: 'In Progress', count: assignments.filter(a => a.status === 'in-progress').length },
    { key: 'completed' as TabType, label: 'Completed', count: assignments.filter(a => ['completed', 'rejected'].includes(a.status)).length },
  ];

  if (isLoading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-agent-DEFAULT mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading your assigned tasks...</p>
          </div>
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
                  Assigned Tasks
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
                {activeTab === 'in-progress' && <PlayIcon className="w-12 h-12 text-gray-400" />}
                {activeTab === 'completed' && <CheckCircleIcon className="w-12 h-12 text-gray-400" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === 'pending' && 'No pending verifications'}
                {activeTab === 'in-progress' && 'No in-progress verifications'}
                {activeTab === 'completed' && 'No completed verifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'pending' && 'All assignments have been started or completed'}
                {activeTab === 'in-progress' && 'No verifications are currently in progress'}
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
                      <span className="px-2 py-1 text-xs font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                        {assignment.materialDetails.deliveryMethod === 'agent_visit' ? '🏠 Agent Visit' : '📦 Drop-off'}
                      </span>
                    </div>
                  </div>

                  {/* Material Images */}
                  {assignment.photos && Array.isArray(assignment.photos) && assignment.photos.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {assignment.photos.slice(0, 2).map((photo: any, idx: number) => {
                          // Photo should now be a proper data URL or regular URL
                          const photoUrl = photo;
                          console.log(`Photo ${idx}:`, photoUrl?.substring(0, 100)); // Debug log
                          const photoKey = `${assignment.id}-${idx}`;
                          const isAnalyzing = analyzingPhoto === photoKey;
                          const analysisResult = photoAnalysisResults[photoKey];
                          
                          return (
                            <div key={idx} className="space-y-2">
                              <div className="relative group">
                                <img
                                  src={photoUrl}
                                  alt={`Material ${idx + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                  onError={(e) => {
                                    console.error('Failed to load image:', photoUrl?.substring(0, 100));
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=';
                                  }}
                                />
                                
                                {/* AI Analysis Button */}
                                <button
                                  onClick={() => analyzePhoto(assignment.id, photoUrl, idx)}
                                  disabled={isAnalyzing}
                                  className="absolute bottom-2 right-2 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-1"
                                  title="AI Analysis"
                                >
                                  {isAnalyzing ? (
                                    <>
                                      <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      <span className="text-xs">Analyzing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <SparklesIcon className="w-3 h-3" />
                                      <span className="text-xs">Analyze</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              {/* AI Analysis Results */}
                              {analysisResult && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs space-y-1">
                                  {analysisResult.error ? (
                                    <p className="text-red-600 dark:text-red-400">
                                      Analysis Error: {analysisResult.error || 'Failed to analyze image'}
                                    </p>
                                  ) : (
                                    <>
                                      {/* Quality Score */}
                                      {analysisResult.result?.quality_score && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600 dark:text-gray-400">Quality Score:</span>
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            {analysisResult.result.quality_score}/10
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Summary */}
                                      {analysisResult.result?.summary && (
                                        <p className="text-gray-700 dark:text-gray-300">
                                          {analysisResult.result.summary}
                                        </p>
                                      )}
                                      
                                      {/* Material Type Match */}
                                      {analysisResult.qualityFactors?.sorting?.comparisonMessage && (
                                        <div className="flex items-start gap-1">
                                          {analysisResult.qualityFactors.sorting.materialTypeMatches ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          <p className="text-gray-700 dark:text-gray-300">
                                            {analysisResult.qualityFactors.sorting.comparisonMessage}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Show more photos indicator */}
                        {assignment.photos.length > 2 && (
                          <div className="col-span-2 text-center">
                            <button
                              onClick={() => viewDetails(assignment)}
                              className="text-xs text-agent-DEFAULT hover:text-agent-DEFAULT/80 font-medium"
                            >
                              +{assignment.photos.length - 2} more photos
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                        </div>
                      </div>

                      {/* Location Info */}
                      {assignment.materialLocation.address && assignment.materialLocation.address !== 'Address not specified' && (
                        <div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span className="truncate">{assignment.materialLocation.address}</span>
                          </div>
                        </div>
                      )}

                      {/* Time Info */}
                      <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
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
                    {assignment.status === 'in-progress' && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          📞 Please contact the supplier to coordinate material collection
                        </p>
                      </div>
                    )}
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
                            Review Supply
                          </button>
                        </>
                      )}
                      
                      {assignment.status === 'in-progress' && (
                        <>
                          <button
                            onClick={() => viewDetails(assignment)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Details & Chat
                          </button>
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
                            Review Supply
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
