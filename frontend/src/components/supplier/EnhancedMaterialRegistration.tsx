'use client';

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import {
  MaterialCategory,
  QualityGrade,
  MaterialRegistrationForm,
  SupplierType
} from '../../types/supplier';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';

// Enhanced schema with AI analysis
const enhancedMaterialSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.nativeEnum(MaterialCategory),
  subCategory: z.string().min(1, 'Sub-category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  condition: z.nativeEnum(QualityGrade),
  expectedPrice: z.number().min(0, 'Price must be positive'),
  minimumPrice: z.number().min(0, 'Minimum price must be positive'),
  negotiable: z.boolean(),
  photos: z.array(z.instanceof(File)).min(1, 'At least one photo is required').max(10, 'Maximum 10 photos allowed'),
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    district: z.string().min(1, 'District is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional()
  }),
  specifications: z.object({
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional()
    }).optional(),
    material: z.string().min(1, 'Material type is required'),
    color: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    manufacturingYear: z.number().optional(),
    additionalDetails: z.record(z.string(), z.any()).optional()
  }),
  tags: z.array(z.string()),
  estimatedPickupDate: z.date().optional()
});

type EnhancedMaterialFormData = z.infer<typeof enhancedMaterialSchema>;



const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Material details and category' },
  { id: 'photos', title: 'Photos', description: 'Upload material photos' },
  { id: 'location', title: 'Location', description: 'Pickup location details' },
  { id: 'pricing', title: 'Pricing', description: 'Set your pricing expectations' },
  { id: 'specifications', title: 'Specifications', description: 'Additional material details' },
  { id: 'review', title: 'Review', description: 'Review and submit' }
];

interface EnhancedMaterialRegistrationProps {
  onComplete?: (material: MaterialRegistrationForm) => void;
  initialData?: Partial<MaterialRegistrationForm>;
}

export default function EnhancedMaterialRegistration({ onComplete, initialData }: EnhancedMaterialRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  

  const dispatch = useAppDispatch();
  const { loading, profile } = useAppSelector(state => state.supplier);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    trigger
  } = useForm<EnhancedMaterialFormData>({
    resolver: zodResolver(enhancedMaterialSchema),
    defaultValues: {
      negotiable: true,
      tags: [],
      photos: [],
      ...initialData
    },
    mode: 'onChange'
  });

  const watchedCategory = watch('category');
  const watchedCondition = watch('condition');

  // Photo upload handlers
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 10 - uploadedPhotos.length);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === newFiles.length) {
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    const updatedPhotos = [...uploadedPhotos, ...newFiles];
    setUploadedPhotos(updatedPhotos);
    setValue('photos', updatedPhotos);
  }, [uploadedPhotos, setValue]);

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    setValue('photos', newPhotos);
  };



  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Navigation handlers
  const nextStep = async () => {
    const fieldsToValidate = getStepFields(currentStep);
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && currentStep < STEPS.length - 1) {
      
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepFields = (step: number): (keyof EnhancedMaterialFormData)[] => {
    switch (step) {
      case 0: return ['title', 'description', 'category', 'subCategory', 'quantity', 'unit', 'condition'];
      case 1: return ['photos'];
      case 2: return ['location'];
      case 3: return ['expectedPrice', 'minimumPrice', 'negotiable'];
      case 4: return ['specifications'];
      default: return [];
    }
  };

  // Submit handler
  const onSubmit = async (data: EnhancedMaterialFormData) => {
    try {
      // Submit to backend
      // await dispatch(createMaterial(data)).unwrap();
      
      onComplete?.(data as MaterialRegistrationForm);
    } catch (error) {
      console.error('Failed to create material:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index <= currentStep ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 ${
                    index < currentStep ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            {/* Render appropriate step content */}
            {currentStep === 2 && (
              <EnhancedLocationStep
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            
            {currentStep !== 2 && currentStep <= 4 && (
              <div>
                {/* Other steps placeholder */}
                <p className="text-gray-600 dark:text-gray-400">
                  Step {currentStep + 1}: {STEPS[currentStep].description}
                </p>
              </div>
            )}


            {/* Review Step */}
            {currentStep === 5 && (
              <ReviewStep
                data={getValues()}
                photoPreviews={photoPreviews}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={false}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading.creating || !isValid}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Submit Material
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// AgentAssignmentStep component removed - agent assignment is no longer part of the workflow

// Enhanced Review Step Component
interface ReviewStepProps {
  data: EnhancedMaterialFormData;
  photoPreviews: string[];
}

function ReviewStep({ data, photoPreviews }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Review Your Submission
        </h3>
        
        <div className="space-y-6">
          {/* Material Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Material Information</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Title</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{data.title}</dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Category</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.category} - {data.subCategory}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Quantity</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.quantity} {data.unit}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Expected Price</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  LKR {data.expectedPrice?.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>


          {/* Photos Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Photos ({photoPreviews.length})
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {photoPreviews.slice(0, 8).map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
              {photoPreviews.length > 8 && (
                <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  +{photoPreviews.length - 8} more
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-100">Ready to Submit</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your material will be submitted for review. Once approved, it will be listed for auction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Location Step with Map
interface EnhancedLocationStepProps {
  register: any;
  control: any;
  errors: any;
  setValue: any;
  watch: any;
}

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

function EnhancedLocationStep({ register, control, errors, setValue, watch }: EnhancedLocationStepProps) {
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Sri Lanka center
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);

  // Watch for address changes
  const watchedAddress = watch('location.address');
  const watchedCity = watch('location.city');
  const watchedDistrict = watch('location.district');

  // Handle map click to set location
  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setValue('location.coordinates', { latitude: lat, longitude: lng });
  };

  // Get location from browser
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setMarkerPosition({ lat: latitude, lng: longitude });
          setValue('location.coordinates', { latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pickup Location
        </h3>
        
        <div className="space-y-6">
          {/* Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Address *
            </label>
            <textarea
              {...register('location.address')}
              rows={3}
              placeholder="Enter complete address with landmarks"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
            )}
          </div>

          {/* City and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City *
              </label>
              <input
                {...register('location.city')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                District *
              </label>
              <Controller
                name="location.district"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.location?.district && (
                <p className="mt-1 text-sm text-red-600">{errors.location.district.message}</p>
              )}
            </div>
          </div>

          {/* Province and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Province *
              </label>
              <Controller
                name="location.province"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select province</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                )}
              />
              {errors.location?.province && (
                <p className="mt-1 text-sm text-red-600">{errors.location.province.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Postal Code
              </label>
              <input
                {...register('location.postalCode')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Pickup Location on Map
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 mb-3"
            >
              <MapPinIcon className="w-4 h-4 mr-2" />
              Use Current Location
            </button>

            {/* OpenStreetMap Container */}
            <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={
                  markerPosition
                    ? `https://www.openstreetmap.org/export/embed.html?bbox=${markerPosition.lng - 0.01},${markerPosition.lat - 0.01},${markerPosition.lng + 0.01},${markerPosition.lat + 0.01}&layer=mapnik&marker=${markerPosition.lat},${markerPosition.lng}`
                    : `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.01},${mapCenter.lng + 0.01},${mapCenter.lat + 0.01}&layer=mapnik`
                }
                className="w-full"
              />
            </div>

            {markerPosition && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                Location selected: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Note: Click "Use Current Location" to set your pickup point. For manual selection, please enter the address details above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}