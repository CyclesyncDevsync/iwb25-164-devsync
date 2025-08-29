'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface MaterialInfo {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  declaredQuantity: number;
  unit: string;
  expectedPrice: number;
  description: string;
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  supplierInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  required: boolean;
  checked?: boolean;
  notes?: string;
}

interface ReviewPhoto {
  id: string;
  url: string;
  type: 'overview' | 'detail' | 'issue' | 'quantity';
  caption?: string;
  timestamp: Date;
}

interface AgentReviewInterfaceProps {
  materialInfo: MaterialInfo;
  workflowId: string;
  agentId: string;
  onReviewComplete?: (review: any) => void;
}

export default function AgentReviewInterface({
  materialInfo,
  workflowId,
  agentId,
  onReviewComplete
}: AgentReviewInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [arrivalTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review state
  const [ratings, setRatings] = useState({
    overall: 0,
    condition: 0,
    quantity: 0
  });
  
  const [quantityVerified, setQuantityVerified] = useState(materialInfo.declaredQuantity);
  const [quantityDiscrepancy, setQuantityDiscrepancy] = useState<number | null>(null);
  const [qualityNotes, setQualityNotes] = useState('');
  const [recommendation, setRecommendation] = useState<'approve' | 'reject' | 'request_second_review' | ''>('');
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  
  // Pricing suggestions (for approved materials)
  const [suggestedStartingPrice, setSuggestedStartingPrice] = useState(materialInfo.expectedPrice * 0.8);
  const [suggestedReservePrice, setSuggestedReservePrice] = useState(materialInfo.expectedPrice * 0.9);
  const [suggestedAuctionDuration, setSuggestedAuctionDuration] = useState(7);

  const REVIEW_STEPS = [
    { id: 'arrival', title: 'Check-in', icon: DocumentCheckIcon },
    { id: 'photos', title: 'Photo Documentation', icon: CameraIcon },
    { id: 'checklist', title: 'Verification Checklist', icon: ClipboardDocumentCheckIcon },
    { id: 'quality', title: 'Quality Assessment', icon: StarIcon },
    { id: 'quantity', title: 'Quantity Verification', icon: DocumentCheckIcon },
    { id: 'recommendation', title: 'Final Recommendation', icon: CheckCircleIcon }
  ];

  const REJECTION_REASONS = [
    'Material does not match description',
    'Quality below acceptable standards',
    'Significant quantity discrepancy',
    'Contamination present',
    'Improper storage/handling',
    'Safety concerns',
    'Incomplete documentation',
    'Other (specify in notes)'
  ];

  // Initialize checklist based on material category
  useEffect(() => {
    const categoryChecklists: Record<string, ChecklistItem[]> = {
      plastic: [
        { id: 'material_match', category: 'identity', description: 'Material type matches description', required: true },
        { id: 'color_consistency', category: 'quality', description: 'Color consistency verified', required: false },
        { id: 'contamination', category: 'quality', description: 'No contamination present', required: true },
        { id: 'sorting', category: 'quality', description: 'Properly sorted by type', required: true },
        { id: 'cleanliness', category: 'quality', description: 'Clean and dry condition', required: true },
        { id: 'quantity_match', category: 'quantity', description: 'Quantity matches declaration', required: true }
      ],
      metal: [
        { id: 'material_match', category: 'identity', description: 'Metal type matches description', required: true },
        { id: 'rust_check', category: 'quality', description: 'Rust/corrosion assessment', required: true },
        { id: 'contamination', category: 'quality', description: 'No hazardous contamination', required: true },
        { id: 'sorting', category: 'quality', description: 'Sorted by metal type', required: true },
        { id: 'quantity_match', category: 'quantity', description: 'Weight matches declaration', required: true }
      ],
      electronics: [
        { id: 'material_match', category: 'identity', description: 'Device type matches description', required: true },
        { id: 'functionality', category: 'quality', description: 'Functionality assessment', required: false },
        { id: 'components', category: 'quality', description: 'Components intact', required: true },
        { id: 'data_wiped', category: 'security', description: 'Data properly wiped', required: true },
        { id: 'hazardous', category: 'safety', description: 'No hazardous materials exposed', required: true },
        { id: 'quantity_match', category: 'quantity', description: 'Item count matches', required: true }
      ]
    };

    const defaultChecklist: ChecklistItem[] = [
      { id: 'material_match', category: 'identity', description: 'Material matches description', required: true },
      { id: 'quality_acceptable', category: 'quality', description: 'Quality meets standards', required: true },
      { id: 'contamination', category: 'quality', description: 'No contamination present', required: true },
      { id: 'quantity_match', category: 'quantity', description: 'Quantity matches declaration', required: true },
      { id: 'packaging', category: 'handling', description: 'Proper packaging/storage', required: false }
    ];

    setChecklist(categoryChecklists[materialInfo.category] || defaultChecklist);
  }, [materialInfo.category]);

  // Handle photo capture
  const handlePhotoCapture = (file: File, type: ReviewPhoto['type'], caption?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto: ReviewPhoto = {
        id: `photo_${Date.now()}`,
        url: e.target?.result as string,
        type,
        caption,
        timestamp: new Date()
      };
      setPhotos([...photos, newPhoto]);
    };
    reader.readAsDataURL(file);
  };

  // Handle checklist item toggle
  const toggleChecklistItem = (itemId: string, notes?: string) => {
    setChecklist(checklist.map(item =>
      item.id === itemId
        ? { ...item, checked: !item.checked, notes }
        : item
    ));
  };

  // Calculate quantity discrepancy percentage
  const calculateDiscrepancyPercentage = () => {
    const discrepancy = Math.abs(materialInfo.declaredQuantity - quantityVerified);
    return ((discrepancy / materialInfo.declaredQuantity) * 100).toFixed(1);
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        workflowId,
        agentId,
        materialId: materialInfo.id,
        visitDate: new Date().toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        departureTime: new Date().toISOString(),
        ratings,
        qualityNotes,
        quantityVerified,
        quantityDiscrepancy: materialInfo.declaredQuantity - quantityVerified,
        photos: photos.map(p => ({ url: p.url, type: p.type, caption: p.caption })),
        verificationChecklist: checklist,
        recommendation,
        rejectionReasons: recommendation === 'reject' ? rejectionReasons : [],
        suggestedStartingPrice: recommendation === 'approve' ? suggestedStartingPrice : null,
        suggestedReservePrice: recommendation === 'approve' ? suggestedReservePrice : null,
        suggestedAuctionDuration: recommendation === 'approve' ? suggestedAuctionDuration : null
      };

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Review submitted:', reviewData);
      onReviewComplete?.(reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star rating component
  const StarRating = ({ rating, onChange, label }: { rating: number; onChange: (r: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <StarIconSolid className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarIcon className="w-8 h-8 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Agent Material Review
        </h1>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Material ID: {materialInfo.id}</span>
          <span>Check-in Time: {arrivalTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Material Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Material Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Title:</span>
            <p className="font-medium">{materialInfo.title}</p>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-medium">{materialInfo.category} - {materialInfo.subCategory}</p>
          </div>
          <div>
            <span className="text-gray-500">Declared Quantity:</span>
            <p className="font-medium">{materialInfo.declaredQuantity} {materialInfo.unit}</p>
          </div>
          <div>
            <span className="text-gray-500">Expected Price:</span>
            <p className="font-medium">LKR {materialInfo.expectedPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {REVIEW_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {index < currentStep ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              {index < REVIEW_STEPS.length - 1 && (
                <div className={`h-1 w-full mx-2 ${
                  index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          {/* Check-in Step */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Check-in Confirmation</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                  You have checked in at the material location. Please proceed with the verification process.
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>Supplier:</strong> {materialInfo.supplierInfo.name}</p>
                <p><strong>Contact:</strong> {materialInfo.supplierInfo.phone}</p>
                <p><strong>Location:</strong> {materialInfo.location.address}</p>
              </div>
            </div>
          )}

          {/* Photo Documentation Step */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Photo Documentation</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Capture photos of the material from different angles and aspects.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {['overview', 'detail', 'quantity', 'issue'].map((type) => (
                  <div key={type} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium capitalize">{type} Photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handlePhotoCapture(e.target.files[0], type as ReviewPhoto['type']);
                        }
                      }}
                      className="hidden"
                      id={`photo-${type}`}
                    />
                    <label
                      htmlFor={`photo-${type}`}
                      className="mt-2 inline-block px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 cursor-pointer"
                    >
                      Capture
                    </label>
                  </div>
                ))}
              </div>

              {photos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Captured Photos ({photos.length})</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.type}
                          className="w-full h-24 object-cover rounded"
                        />
                        <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
                          {photo.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Checklist Step */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Verification Checklist</h2>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={item.checked || false}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">
                            {item.category} {item.required && <span className="text-red-500">*</span>}
                          </p>
                        </div>
                      </div>
                      {item.checked === false && item.required && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Assessment Step */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Quality Assessment</h2>
              
              <StarRating
                rating={ratings.overall}
                onChange={(r) => setRatings({ ...ratings, overall: r })}
                label="Overall Quality Rating"
              />
              
              <StarRating
                rating={ratings.condition}
                onChange={(r) => setRatings({ ...ratings, condition: r })}
                label="Material Condition"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality Notes
                </label>
                <textarea
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe material condition, any issues, or notable observations..."
                />
              </div>
            </div>
          )}

          {/* Quantity Verification Step */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Quantity Verification</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verified Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={quantityVerified}
                    onChange={(e) => setQuantityVerified(Number(e.target.value))}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="text-gray-500">{materialInfo.unit}</span>
                </div>
              </div>

              {quantityVerified !== materialInfo.declaredQuantity && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        Quantity Discrepancy Detected
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Declared: {materialInfo.declaredQuantity} {materialInfo.unit} | 
                        Verified: {quantityVerified} {materialInfo.unit} |
                        Difference: {calculateDiscrepancyPercentage()}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <StarRating
                rating={ratings.quantity}
                onChange={(r) => setRatings({ ...ratings, quantity: r })}
                label="Quantity Accuracy Rating"
              />
            </div>
          )}

          {/* Final Recommendation Step */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Final Recommendation</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setRecommendation('approve')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      recommendation === 'approve'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium">Approve</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecommendation('reject')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      recommendation === 'reject'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    <XCircleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="font-medium">Reject</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecommendation('request_second_review')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      recommendation === 'request_second_review'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-300 hover:border-yellow-300'
                    }`}
                  >
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-medium">Second Review</p>
                  </button>
                </div>

                {recommendation === 'reject' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Rejection Reasons</h4>
                    {REJECTION_REASONS.map((reason) => (
                      <label key={reason} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rejectionReasons.includes(reason)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRejectionReasons([...rejectionReasons, reason]);
                            } else {
                              setRejectionReasons(rejectionReasons.filter(r => r !== reason));
                            }
                          }}
                          className="h-4 w-4 text-emerald-600 rounded"
                        />
                        <span className="text-sm">{reason}</span>
                      </label>
                    ))}
                  </div>
                )}

                {recommendation === 'approve' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Auction Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Starting Price (LKR)
                        </label>
                        <input
                          type="number"
                          value={suggestedStartingPrice}
                          onChange={(e) => setSuggestedStartingPrice(Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reserve Price (LKR)
                        </label>
                        <input
                          type="number"
                          value={suggestedReservePrice}
                          onChange={(e) => setSuggestedReservePrice(Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration (Days)
                        </label>
                        <select
                          value={suggestedAuctionDuration}
                          onChange={(e) => setSuggestedAuctionDuration(Number(e.target.value))}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {[3, 5, 7, 10, 14].map(days => (
                            <option key={days} value={days}>{days} days</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Previous
        </button>

        {currentStep < REVIEW_STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && photos.length === 0) ||
              (currentStep === 2 && !checklist.filter(i => i.required).every(i => i.checked !== undefined)) ||
              (currentStep === 3 && ratings.overall === 0) ||
              (currentStep === 4 && quantityVerified === 0)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            Next
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !recommendation}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        )}
      </div>
    </div>
  );
}