'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ArrowLeftIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';
import AgentLayout from '@/components/layout/AgentLayout';

// Define proper interfaces
interface MaterialSpecifications {
  condition: string;
  contamination: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  notes?: string;
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: number;
}

interface MaterialData {
  id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedWeight?: number;
  qualityScore?: number;
  photos: string[];
  location: Location;
  supplier: {
    id: string;
    name: string;
    contact: string;
  };
  verification: {
    agentId: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    issues?: string[];
  };
}

// Simple Camera Capture Component (inline since import might fail)
const SimpleCameraCapture = ({ 
  onPhotosCapture, 
  existingPhotos = []
}: { 
  onPhotosCapture: (photos: string[]) => void;
  existingPhotos: string[];
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);

  const handleFileCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPhotos.push(e.target.result as string);
          if (newPhotos.length === files.length) {
            const updatedPhotos = [...photos, ...newPhotos];
            setPhotos(updatedPhotos);
            onPhotosCapture(updatedPhotos);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Capture Material Photos
      </h3>
      
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <div className="text-center">
          <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="cursor-pointer bg-agent-DEFAULT text-white px-4 py-2 rounded-md hover:bg-agent-DEFAULT/90">
              <span>Take Photos</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleFileCapture}
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Capture multiple angles of the material
          </p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Material photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <button
          onClick={() => onPhotosCapture(photos)}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Continue with {photos.length} Photo{photos.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

// Simple Quality Assessment Component
const SimpleQualityAssessment = ({ 
  materialType, 
  photos, 
  onSubmit, 
  existingScore 
}: { 
  materialType: string;
  photos: string[];
  onSubmit: (score: number, notes?: string) => void;
  existingScore?: number | null;
}) => {
  const [score, setScore] = useState(existingScore || 0);
  const [notes, setNotes] = useState('');

  const qualityFactors = [
    { name: 'Cleanliness', weight: 0.3 },
    { name: 'Condition', weight: 0.25 },
    { name: 'Purity', weight: 0.25 },
    { name: 'Quantity Match', weight: 0.2 }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Quality Assessment - {materialType}
      </h3>

      <div className="bg-white dark:bg-dark-surface rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Overall Quality Score
        </h4>
        
        <div className="flex items-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setScore(num)}
              className={`w-8 h-8 rounded-full border-2 text-sm font-medium ${
                score >= num
                  ? 'bg-agent-DEFAULT border-agent-DEFAULT text-white'
                  : 'border-gray-300 text-gray-500 hover:border-agent-DEFAULT'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className={`text-center p-2 rounded ${
          score >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
          score >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
          score > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {score >= 8 ? 'Excellent Quality' :
           score >= 6 ? 'Good Quality' :
           score > 0 ? 'Poor Quality' :
           'Rate the material quality'}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-DEFAULT dark:bg-gray-700 dark:text-white"
          placeholder="Any observations or concerns..."
        />
      </div>

      <button
        onClick={() => onSubmit(score, notes)}
        disabled={score === 0}
        className="w-full bg-agent-DEFAULT text-white py-3 rounded-lg hover:bg-agent-DEFAULT/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Specifications
      </button>
    </div>
  );
};

// Simple Material Specification Form
const SimpleMaterialSpecForm = ({ 
  materialData, 
  onSubmit, 
  existingSpecs 
}: { 
  materialData: MaterialData;
  onSubmit: (specs: MaterialSpecifications) => void;
  existingSpecs?: MaterialSpecifications | null;
}) => {
  const [specs, setSpecs] = useState<MaterialSpecifications>(
    existingSpecs || {
      condition: '',
      contamination: '',
      weight: materialData.quantity || 0,
      notes: ''
    }
  );

  const handleSubmit = () => {
    if (specs.condition && specs.contamination) {
      onSubmit(specs);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Material Specifications
      </h3>

      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Material Condition
          </label>
          <select
            value={specs.condition}
            onChange={(e) => setSpecs({ ...specs, condition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-DEFAULT dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contamination Level
          </label>
          <select
            value={specs.contamination}
            onChange={(e) => setSpecs({ ...specs, contamination: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-DEFAULT dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select contamination level</option>
            <option value="none">None</option>
            <option value="minimal">Minimal</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actual Weight (kg)
          </label>
          <input
            type="number"
            value={specs.weight}
            onChange={(e) => setSpecs({ ...specs, weight: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-DEFAULT dark:bg-gray-700 dark:text-white"
            placeholder="Enter actual weight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            value={specs.notes}
            onChange={(e) => setSpecs({ ...specs, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-DEFAULT dark:bg-gray-700 dark:text-white"
            placeholder="Additional observations..."
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!specs.condition || !specs.contamination}
        className="w-full bg-agent-DEFAULT text-white py-3 rounded-lg hover:bg-agent-DEFAULT/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Review
      </button>
    </div>
  );
};

// Simple Offline Storage utility
const OfflineStorage = {
  saveVerification: async (data: any) => {
    try {
      const stored = localStorage.getItem('offline-verifications') || '[]';
      const verifications = JSON.parse(stored);
      verifications.push({ ...data, id: Date.now().toString(), offline: true });
      localStorage.setItem('offline-verifications', JSON.stringify(verifications));
      return true;
    } catch (error) {
      console.error('Failed to save offline:', error);
      return false;
    }
  }
};

const VerifyMaterialPage = () => {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(true);
  const [materialData, setMaterialData] = useState<MaterialData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [specifications, setSpecifications] = useState<MaterialSpecifications | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Photo Capture', icon: CameraIcon },
    { id: 2, title: 'Quality Assessment', icon: CheckCircleIcon },
    { id: 3, title: 'Specifications', icon: PhotoIcon },
    { id: 4, title: 'Review & Submit', icon: CheckCircleIcon }
  ];

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(navigator.onLine);
    const handleOffline = () => setIsOnline(navigator.onLine);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    // Load assignment data (mock data for now)
    setMaterialData({
      id: params.id as string,
      type: 'Plastic Bottles',
      category: 'PET',
      quantity: 500,
      unit: 'kg',
      photos: [],
      location: {
        latitude: 0,
        longitude: 0,
        timestamp: Date.now()
      },
      supplier: {
        id: 'supplier-1',
        name: 'Green Recyclers Pvt Ltd',
        contact: '+94 77 123 4567'
      },
      verification: {
        agentId: 'agent-1',
        timestamp: Date.now(),
        status: 'pending'
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [params.id]);

  const handlePhotosCapture = useCallback((capturedPhotos: string[]) => {
    setPhotos(capturedPhotos);
    if (capturedPhotos.length > 0) {
      setCurrentStep(2);
    }
  }, []);

  const handleQualitySubmit = useCallback((score: number, notes?: string) => {
    setQualityScore(score);
    setCurrentStep(3);
  }, []);

  const handleSpecificationSubmit = useCallback((specs: MaterialSpecifications) => {
    setSpecifications(specs);
    setCurrentStep(4);
  }, []);

  const handleFinalSubmit = async () => {
    if (!materialData || !location) return;

    setIsSubmitting(true);

    const verificationData = {
      ...materialData,
      photos,
      qualityScore,
      specifications,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: Date.now()
      },
      verification: {
        ...materialData.verification,
        status: qualityScore && qualityScore >= 6 ? 'approved' as const : 'rejected' as const,
        timestamp: Date.now(),
        qualityScore,
        specifications
      }
    };

    try {
      if (isOnline) {
        // Mock API call - replace with actual endpoint when available
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/agent?success=verification-submitted');
      } else {
        // Store offline
        await OfflineStorage.saveVerification(verificationData);
        router.push('/agent?success=verification-saved-offline');
      }
    } catch (error) {
      console.error('Submission error:', error);
      // Fallback to offline storage
      await OfflineStorage.saveVerification(verificationData);
      router.push('/agent?success=verification-saved-offline');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!materialData) {
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
        {/* Header */}
        <div className="bg-white dark:bg-dark-surface shadow-sm border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Material Verification
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {materialData.supplier.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <WifiIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <SignalSlashIcon className="w-5 h-5 text-red-500" />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-dark-surface border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-agent-DEFAULT border-agent-DEFAULT text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
              >
                <SimpleCameraCapture
                  onPhotosCapture={handlePhotosCapture}
                  existingPhotos={photos}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="quality"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
              >
                <SimpleQualityAssessment
                  materialType={materialData.type}
                  photos={photos}
                  onSubmit={handleQualitySubmit}
                  existingScore={qualityScore}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
              >
                <SimpleMaterialSpecForm
                  materialData={materialData}
                  onSubmit={handleSpecificationSubmit}
                  existingSpecs={specifications}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
              >
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Verification Summary
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Material Type:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{materialData.type}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score:</span>
                        <p className={`font-medium ${
                          qualityScore && qualityScore >= 8 ? 'text-green-600' :
                          qualityScore && qualityScore >= 6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {qualityScore}/10
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Photos:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{photos.length} captured</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {location ? '✓ GPS Tagged' : '✗ No GPS'}
                        </p>
                      </div>
                    </div>

                    {/* Decision */}
                    <div className={`p-3 rounded-lg border ${
                      qualityScore && qualityScore >= 6
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    }`}>
                      <div className="flex items-center">
                        {qualityScore && qualityScore >= 6 ? (
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 mr-2" />
                        )}
                        <span className="font-medium">
                          Material {qualityScore && qualityScore >= 6 ? 'APPROVED' : 'REJECTED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-agent-DEFAULT text-white py-3 px-4 rounded-lg font-medium hover:bg-agent-DEFAULT/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                  </button>

                  {/* Navigation */}
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Back to Specifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AgentLayout>
  );
};

export default VerifyMaterialPage;
