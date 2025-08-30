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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface MaterialDetailsModalProps {
  assignment: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MaterialDetailsModal({ assignment, isOpen, onClose }: MaterialDetailsModalProps) {
  const [analyzingPhoto, setAnalyzingPhoto] = useState<number | null>(null);
  const [photoAnalysisResults, setPhotoAnalysisResults] = useState<{[key: number]: any}>({});

  if (!isOpen || !assignment) return null;

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

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Assignment created on {format(new Date(assignment.createdAt), 'PPP')} at {format(new Date(assignment.createdAt), 'p')}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-agent-DEFAULT hover:bg-agent-DEFAULT/90 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}