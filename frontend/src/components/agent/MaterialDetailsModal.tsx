'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  PhotoIcon,
  DocumentTextIcon,
  UserIcon,
  TruckIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface MaterialDetailsModalProps {
  assignment: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MaterialDetailsModal({ assignment, isOpen, onClose }: MaterialDetailsModalProps) {
  const [analyzingPhoto, setAnalyzingPhoto] = useState<number | null>(null);
  const [photoAnalysisResults, setPhotoAnalysisResults] = useState<{[key: number]: any}>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  if (!isOpen || !assignment) return null;

  // Debug log to check photos data
  console.log('Assignment photos:', assignment.photos);
  console.log('Assignment data:', assignment);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAccept = () => {
    setIsReviewing(true);
    // Simulate API call
    setTimeout(() => {
      showNotification('Material supply has been accepted successfully!', 'success');
      setIsReviewing(false);
      // Update the assignment status locally
      if (assignment) {
        assignment.status = 'completed';
      }
      setTimeout(() => onClose(), 1500);
    }, 1000);
  };

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }
    setIsReviewing(true);
    // Simulate API call
    setTimeout(() => {
      showNotification('Material supply has been rejected', 'error');
      setIsReviewing(false);
      // Update the assignment status locally
      if (assignment) {
        assignment.status = 'rejected';
      }
      setTimeout(() => onClose(), 1500);
    }, 1000);
  };

  const analyzePhoto = async (photo: string, index: number) => {
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
        wasteStreamId: assignment.materialId,
        wasteType: assignment.materialDetails.type || 'plastic',
        location: assignment.materialLocation?.address?.split(',')[0] || 'Unknown',
        fieldAgentId: assignment.id,
        imageData: base64Data,
        imageFormat: imageFormat,
        fileName: `material_${assignment.materialId}_photo_${index}.${imageFormat}`,
        metadata: {
          submissionId: assignment.materialId,
          supplierId: assignment.supplierId,
          assignmentId: assignment.id
        }
      };
      
      console.log('Sending image for AI analysis...');
      
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Assignment Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Material verification assignment #{assignment.assignmentId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assignment Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-agent-DEFAULT" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <div>{getStatusBadge(assignment.status)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Priority:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  assignment.urgency === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                  assignment.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {assignment.urgency} priority
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Assigned:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(assignment.assignedAt), 'PPP')}
                </span>
              </div>
              {assignment.startedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Started:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(assignment.startedAt), 'PPP')}
                  </span>
                </div>
              )}
              {assignment.completedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Completed:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(assignment.completedAt), 'PPP')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Time:</span>
                <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {assignment.estimatedTime} minutes
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-agent-DEFAULT" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Supplier Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Supplier Name:</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.supplierName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Supplier ID:</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.supplierId}</p>
              </div>
            </div>
          </div>

          {/* Material Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ScaleIcon className="w-5 h-5 text-agent-DEFAULT" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Material Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Title:</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.title}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {assignment.materialDetails.quantity} {assignment.materialDetails.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Condition:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {assignment.materialDetails.condition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {assignment.category}
                </span>
              </div>
              {assignment.materialDetails.subCategory && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sub Category:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {assignment.materialDetails.subCategory}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Delivery Method:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {assignment.materialDetails.deliveryMethod?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Negotiable:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {assignment.materialDetails.negotiable ? 'Yes' : 'No'}
                </span>
              </div>
              {assignment.materialDetails.description && assignment.materialDetails.description !== 'No description' && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="text-sm text-gray-900 dark:text-white italic mt-1">
                    "{assignment.materialDetails.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-agent-DEFAULT" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pricing</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Expected Price:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${assignment.materialDetails.expectedPrice?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Minimum Price:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${assignment.materialDetails.minimumPrice?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-agent-DEFAULT" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Location Details</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialLocation.address}</p>
                </div>
                {assignment.materialLocation.city && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">City:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialLocation.city}</p>
                  </div>
                )}
                {assignment.materialLocation.district && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">District:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialLocation.district}</p>
                  </div>
                )}
                {assignment.materialLocation.province && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Province:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialLocation.province}</p>
                  </div>
                )}
                {assignment.materialLocation.postalCode && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Postal Code:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialLocation.postalCode}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Latitude:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{assignment.materialLocation.latitude}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Longitude:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{assignment.materialLocation.longitude}</p>
                  </div>
                </div>
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => {
                      const url = `https://maps.google.com/?q=${assignment.materialLocation.latitude},${assignment.materialLocation.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-agent-DEFAULT hover:bg-agent-DEFAULT/90 rounded-lg transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Open in Maps
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Material Details */}
          {(assignment.materialDetails.subCategory || assignment.materialDetails.materialType || 
            assignment.materialDetails.color || assignment.materialDetails.brand || 
            assignment.materialDetails.model || assignment.materialDetails.manufacturingYear) && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {assignment.materialDetails.subCategory && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Sub Category:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.subCategory}</p>
                  </div>
                )}
                {assignment.materialDetails.materialType && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Material Type:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.materialType}</p>
                  </div>
                )}
                {assignment.materialDetails.color && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Color:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.color}</p>
                  </div>
                )}
                {assignment.materialDetails.brand && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Brand:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.brand}</p>
                  </div>
                )}
                {assignment.materialDetails.model && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Model:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.model}</p>
                  </div>
                )}
                {assignment.materialDetails.manufacturingYear && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Manufacturing Year:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.manufacturingYear}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dimensions */}
          {assignment.materialDetails.dimensions && (assignment.materialDetails.dimensions.length || 
            assignment.materialDetails.dimensions.width || assignment.materialDetails.dimensions.height || 
            assignment.materialDetails.dimensions.weight) && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <ScaleIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dimensions</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {assignment.materialDetails.dimensions.length && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Length:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.dimensions.length} cm</p>
                  </div>
                )}
                {assignment.materialDetails.dimensions.width && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Width:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.dimensions.width} cm</p>
                  </div>
                )}
                {assignment.materialDetails.dimensions.height && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Height:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.dimensions.height} cm</p>
                  </div>
                )}
                {assignment.materialDetails.dimensions.weight && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Weight:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.materialDetails.dimensions.weight} kg</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warehouse Information */}
          {(assignment.warehouse?.name || assignment.warehouse?.address || assignment.warehouse?.phone) && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Warehouse Details</h3>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="space-y-3">
                  {assignment.warehouse.name && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Warehouse Name:</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.warehouse.name}</p>
                    </div>
                  )}
                  {assignment.warehouse.address && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.warehouse.address}</p>
                    </div>
                  )}
                  {assignment.warehouse.phone && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.warehouse.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {(assignment.transactionId || assignment.workflowId) && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Transaction Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {assignment.transactionId && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{assignment.transactionId}</p>
                  </div>
                )}
                {assignment.workflowId && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Workflow ID:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{assignment.workflowId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Material Photos */}
          {assignment.photos && Array.isArray(assignment.photos) && assignment.photos.length > 0 && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Material Photos</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {assignment.photos.map((photo: any, index: number) => {
                  // Handle different photo formats
                  let photoUrl = photo;
                  if (typeof photo === 'object' && photo.data) {
                    photoUrl = photo.data;
                  }
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={photoUrl}
                          alt={`Material photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            console.error('Image failed to load:', index);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(photoUrl, '_blank')}
                            className="p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                            title="View full size"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => analyzePhoto(photoUrl, index)}
                            disabled={analyzingPhoto === index}
                            className="p-2 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700 disabled:bg-gray-400"
                            title="AI Analysis"
                          >
                            {analyzingPhoto === index ? (
                              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* AI Analysis Results */}
                      {photoAnalysisResults[index] && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                          {photoAnalysisResults[index].error ? (
                            <p className="text-red-600 dark:text-red-400">
                              Analysis failed: {photoAnalysisResults[index].error}
                            </p>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900 dark:text-white mb-1">AI Analysis:</p>
                              {photoAnalysisResults[index].qualityScore && (
                                <p className="text-gray-700 dark:text-gray-300">
                                  Quality Score: <span className="font-medium">{photoAnalysisResults[index].qualityScore.toFixed(1)}/10</span>
                                </p>
                              )}
                              {photoAnalysisResults[index].estimatedWeight && (
                                <p className="text-gray-700 dark:text-gray-300">
                                  Est. Weight: <span className="font-medium">{photoAnalysisResults[index].estimatedWeight} kg</span>
                                </p>
                              )}
                              {photoAnalysisResults[index].recommendations && photoAnalysisResults[index].recommendations.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-gray-600 dark:text-gray-400">Recommendations:</p>
                                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                    {photoAnalysisResults[index].recommendations.slice(0, 2).map((rec: string, i: number) => (
                                      <li key={i}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
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

          {/* Tags */}
          {assignment.tags && Array.isArray(assignment.tags) && assignment.tags.length > 0 && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {assignment.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {assignment.notes && (
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-agent-DEFAULT" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-900 dark:text-white">{assignment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Review Section */}
        {assignment.status === 'pending' && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Review Material Supply</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Review Notes (Required for rejection)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-agent-DEFAULT focus:border-agent-DEFAULT dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add any notes about this material supply..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Assignment created on {format(new Date(assignment.createdAt), 'PPP')} at {format(new Date(assignment.createdAt), 'p')}
            </div>
            <div className="flex gap-3">
              {assignment.status === 'pending' ? (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isReviewing}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isReviewing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={isReviewing}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isReviewing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                    )}
                    Accept
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-agent-DEFAULT hover:bg-agent-DEFAULT/90 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            toastType === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircleIcon className="w-6 h-6" />
          ) : (
            <XCircleIcon className="w-6 h-6" />
          )}
          <span className="font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
}