'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Define enums locally to avoid imports
enum MaterialCategory {
  PLASTIC = 'plastic',
  METAL = 'metal',
  PAPER = 'paper',
  GLASS = 'glass',
  ELECTRONICS = 'electronics',
  TEXTILES = 'textiles',
  RUBBER = 'rubber',
  WOOD = 'wood',
  ORGANIC = 'organic',
  COMPOSITES = 'composites'
}

enum QualityGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

// Schema
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
  deliveryMethod: z.enum(['agent_visit', 'drop_off']),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
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
}).refine((data) => {
  // Location fields are required only for agent visits
  if (data.deliveryMethod === 'agent_visit') {
    return data.location.address && data.location.city && 
           data.location.district && data.location.province;
  }
  return true;
}, {
  message: "Location details are required for agent visits",
  path: ["location"]
});

type EnhancedMaterialFormData = z.infer<typeof enhancedMaterialSchema>;

interface SubmissionResult {
  workflowId?: string;
  transactionId?: string;
  supplierId?: string;
}


const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Material details and category' },
  { id: 'photos', title: 'Photos', description: 'Upload material photos' },
  { id: 'delivery', title: 'Delivery Method', description: 'Choose verification location' },
  { id: 'location', title: 'Location', description: 'Pickup location details' },
  { id: 'pricing', title: 'Pricing', description: 'Set your pricing expectations' },
  { id: 'specifications', title: 'Specifications', description: 'Additional material details' },
  { id: 'review', title: 'Review', description: 'Review and submit' }
];

const CATEGORY_SUBCATEGORIES = {
  [MaterialCategory.PLASTIC]: ['PET Bottles', 'HDPE Containers', 'PVC Pipes', 'Polystyrene', 'Mixed Plastics'],
  [MaterialCategory.METAL]: ['Aluminum Cans', 'Steel Scraps', 'Copper Wire', 'Brass Items', 'Iron Sheets'],
  [MaterialCategory.PAPER]: ['Cardboard', 'Newspapers', 'Office Paper', 'Magazines', 'Books'],
  [MaterialCategory.GLASS]: ['Clear Glass', 'Colored Glass', 'Bottles', 'Windows', 'Mirrors'],
  [MaterialCategory.ELECTRONICS]: ['Mobile Phones', 'Computers', 'TVs', 'Appliances', 'Components'],
  [MaterialCategory.TEXTILES]: ['Cotton Clothes', 'Synthetic Fabrics', 'Leather Items', 'Shoes', 'Bags'],
  [MaterialCategory.RUBBER]: ['Tires', 'Tubes', 'Footwear', 'Industrial Parts', 'Seals'],
  [MaterialCategory.WOOD]: ['Furniture', 'Construction Wood', 'Pallets', 'Sawdust', 'Bamboo'],
  [MaterialCategory.ORGANIC]: ['Food Waste', 'Garden Waste', 'Agricultural Waste', 'Coconut Husks'],
  [MaterialCategory.COMPOSITES]: ['Fiberglass', 'Carbon Fiber', 'Mixed Materials', 'Laminates']
};

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

interface StandaloneMaterialRegistrationProps {
  onComplete?: (material: any, submissionResult: SubmissionResult) => void;
}

export default function StandaloneMaterialRegistration({ onComplete }: StandaloneMaterialRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  

  // No Redux, no auth checks
  const loading = { creating: false };

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
      deliveryMethod: 'agent_visit'
    },
    mode: 'onChange'
  });

  const watchedCategory = watch('category');
  const watchedCondition = watch('condition');
  const watchedDeliveryMethod = watch('deliveryMethod');

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

  // Submit material to backend
  const submitMaterial = async () => {
    if (uploadedPhotos.length === 0) return;
    
    try {
      // Get current form data
      const formData = getValues();
      
      // Convert photos to base64
      const photoPromises = uploadedPhotos.map(photo => convertFileToBase64(photo));
      const base64Photos = await Promise.all(photoPromises);
      
      // Prepare submission data for backend
      const submissionData = {
        materialData: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          subCategory: formData.subCategory,
          quantity: formData.quantity,
          unit: formData.unit,
          condition: formData.condition,
          location: formData.location,
          pricing: {
            expectedPrice: formData.expectedPrice,
            minimumPrice: formData.minimumPrice,
            negotiable: formData.negotiable || true,
            currency: "LKR"
          },
          specifications: formData.specifications,
          tags: formData.tags,
          deliveryMethod: formData.deliveryMethod
        },
        photos: base64Photos.map((base64, index) => ({
          data: base64,
          filename: uploadedPhotos[index].name,
          type: uploadedPhotos[index].type
        }))
      };

      // Call the actual backend API
      const response = await fetch('http://localhost:8086/api/material/workflow/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Log the response for debugging
      console.log('Backend response:', result);
      
      // Store submission result
      const submissionResult: SubmissionResult = {
        workflowId: result.workflowId,
        transactionId: result.transactionId,
        supplierId: result.supplierId
      };
      
      setSubmissionResult(submissionResult);
      
      return submissionResult;
      
    } catch (error) {
      console.error('Submission failed:', error);
      return null;
    }
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
      case 2: return ['deliveryMethod'];
      case 3: return ['location'];
      case 4: return ['expectedPrice', 'minimumPrice', 'negotiable'];
      case 5: return ['specifications'];
      default: return [];
    }
  };

  // Submit handler
  const onSubmit = async (data: EnhancedMaterialFormData) => {
    try {
      // First submit the material
      const result = await submitMaterial();
      
      if (!result) {
        throw new Error('Submission failed');
      }

      // Extract the IDs from the response
      const transactionId = result.transactionId || 'TXN_PENDING';
      const supplierId = result.supplierId || 'SUPPLIER_MOCK';
      const workflowId = result.workflowId || 'WORKFLOW_PENDING';
      
      alert(`🎉 Material submission successful!\n\nTransaction ID: ${transactionId}\nWorkflow ID: ${workflowId}\nSupplier ID: ${supplierId}`);

      // Call completion callback only on success
      console.log('📋 Material submitted successfully:', data);
      console.log('📊 Submission result:', result);
      
      onComplete?.(data, result);
      
    } catch (error) {
      console.error('❌ Failed to submit material:', error);
      alert('Failed to submit material. Please try again.');
    }
  };

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileUpload(e.dataTransfer.files);
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
            {/* Render Basic Information Step */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Material Title *
                      </label>
                      <input
                        {...register('title')}
                        type="text"
                        placeholder="e.g., High-Quality Aluminum Sheets"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description *
                      </label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        placeholder="Describe your material in detail..."
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category *
                        </label>
                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="">Select category</option>
                              {Object.values(MaterialCategory).map(category => (
                                <option key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sub-category *
                        </label>
                        <Controller
                          name="subCategory"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              disabled={!watchedCategory}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            >
                              <option value="">Select sub-category</option>
                              {watchedCategory && CATEGORY_SUBCATEGORIES[watchedCategory]?.map(subCat => (
                                <option key={subCat} value={subCat}>
                                  {subCat}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.subCategory && (
                          <p className="mt-1 text-sm text-red-600">{errors.subCategory.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quantity *
                        </label>
                        <input
                          {...register('quantity', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Unit *
                        </label>
                        <select
                          {...register('unit')}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select unit</option>
                          <option value="kg">Kilograms</option>
                          <option value="tons">Tons</option>
                          <option value="pieces">Pieces</option>
                          <option value="liters">Liters</option>
                        </select>
                        {errors.unit && (
                          <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Condition *
                        </label>
                        <Controller
                          name="condition"
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="">Select condition</option>
                              {Object.values(QualityGrade).map(grade => (
                                <option key={grade} value={grade}>
                                  {grade.charAt(0).toUpperCase() + grade.slice(1)}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.condition && (
                          <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photo Upload Step */}
            {currentStep === 1 && (
              <PhotoUploadStep
                uploadedPhotos={uploadedPhotos}
                photoPreviews={photoPreviews}
                isDragActive={isDragActive}
                onFileUpload={handleFileUpload}
                onRemovePhoto={removePhoto}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                errors={errors}
              />
            )}

            {/* Delivery Method Step */}
            {currentStep === 2 && (
              <DeliveryMethodStep
                control={control}
                errors={errors}
                watchedDeliveryMethod={watchedDeliveryMethod}
              />
            )}

            {/* Location Step */}
            {currentStep === 3 && (
              <LocationStep
                register={register}
                control={control}
                errors={errors}
                setValue={setValue}
                deliveryMethod={watchedDeliveryMethod}
              />
            )}

            {/* Pricing Step */}
            {currentStep === 4 && (
              <PricingStep
                register={register}
                control={control}
                errors={errors}
                watchedCondition={watchedCondition}
              />
            )}

            {/* Specifications Step */}
            {currentStep === 5 && (
              <SpecificationsStep
                register={register}
                control={control}
                errors={errors}
                tags={tags}
                tagInput={tagInput}
                onTagInputChange={setTagInput}
                onAddTag={addTag}
                onRemoveTag={removeTag}
              />
            )}



            {/* Review Step */}
            {currentStep === 6 && (
              <ReviewStep
                data={getValues()}
                photoPreviews={photoPreviews}
                deliveryMethod={watchedDeliveryMethod}
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

// Component implementations (simplified versions)
function DeliveryMethodStep({ control, errors, watchedDeliveryMethod }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Delivery Method
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose how you want our agent to verify the quality of your material
        </p>

        <Controller
          name="deliveryMethod"
          control={control}
          render={({ field }) => (
            <div className="space-y-4">
              <label className="relative flex items-start p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  {...field}
                  value="agent_visit"
                  checked={field.value === 'agent_visit'}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                  field.value === 'agent_visit' 
                    ? 'border-emerald-600 bg-emerald-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {field.value === 'agent_visit' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Agent Visit to My Location
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Our agent will come to your location to verify the material quality
                  </p>
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                      Additional charges will apply for agent travel expenses, regardless of whether the material is selected for bidding
                    </p>
                  </div>
                </div>
              </label>

              <label className="relative flex items-start p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  {...field}
                  value="drop_off"
                  checked={field.value === 'drop_off'}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                  field.value === 'drop_off' 
                    ? 'border-emerald-600 bg-emerald-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {field.value === 'drop_off' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    I'll Bring to Your Center
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You will bring the material to our nearest collection center for verification
                  </p>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <MapPinIcon className="w-4 h-4 inline mr-1" />
                      Note: You must take the material back with you if it's not selected for auction
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}
        />

        {errors.deliveryMethod && (
          <p className="mt-2 text-sm text-red-600">{errors.deliveryMethod.message}</p>
        )}
      </div>
    </div>
  );
}

function PhotoUploadStep({ uploadedPhotos, photoPreviews, isDragActive, onFileUpload, onRemovePhoto, onDragEnter, onDragLeave, onDrop, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Upload Photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Add high-quality photos of your material. The first photo will be used as the main image.
        </p>

        {/* Upload Area */}
        <div
          onDragEnter={onDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="cursor-pointer">
              <span className="text-emerald-600 hover:text-emerald-500 font-medium">
                Click to upload
              </span>
              <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to 10MB each (Max 10 photos)
          </p>
        </div>

        {errors.photos && (
          <p className="mt-2 text-sm text-red-600">{errors.photos.message}</p>
        )}

        {/* Photo Previews */}
        {photoPreviews.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Uploaded Photos ({photoPreviews.length}/10)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LocationStep({ register, control, errors, setValue, deliveryMethod }: any) {
  // Warehouse locations (dummy coordinates)
  const warehouseLocations = [
    { 
      name: "Colombo Collection Center", 
      address: "123 Main Street, Colombo 03", 
      coords: { lat: 6.9271, lng: 79.8612 },
      phone: "+94 11 234 5678"
    },
    {
      name: "Kandy Collection Center",
      address: "456 Temple Road, Kandy",
      coords: { lat: 7.2906, lng: 80.6337 },
      phone: "+94 81 234 5678"
    },
    {
      name: "Galle Collection Center", 
      address: "789 Fort Road, Galle",
      coords: { lat: 6.0329, lng: 80.2168 },
      phone: "+94 91 234 5678"
    }
  ];
  
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouseLocations[0]);
  const [mapCenter, setMapCenter] = useState(deliveryMethod === 'drop_off' ? selectedWarehouse.coords : { lat: 7.8731, lng: 80.7718 });
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    deliveryMethod === 'drop_off' ? selectedWarehouse.coords : null
  );
  const mapRef = useRef<HTMLIFrameElement>(null);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator && deliveryMethod === 'agent_visit') {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setMapCenter(coords);
        setMarkerPosition(coords);
        setValue('location.coordinates', {
          latitude: coords.lat,
          longitude: coords.lng
        });
      });
    }
  };

  const handleWarehouseChange = (warehouseIndex: number) => {
    const warehouse = warehouseLocations[warehouseIndex];
    setSelectedWarehouse(warehouse);
    setMapCenter(warehouse.coords);
    setMarkerPosition(warehouse.coords);
  };

  // Generate OpenStreetMap URL with marker
  const getMapUrl = () => {
    const zoom = 13;
    if (markerPosition) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${markerPosition.lng - 0.01},${markerPosition.lat - 0.01},${markerPosition.lng + 0.01},${markerPosition.lat + 0.01}&layer=mapnik&marker=${markerPosition.lat},${markerPosition.lng}`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.01},${mapCenter.lng + 0.01},${mapCenter.lat + 0.01}&layer=mapnik`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {deliveryMethod === 'agent_visit' ? 'Pickup Location' : 'Collection Center'}
        </h3>
        
        <div className="space-y-6">
          {deliveryMethod === 'drop_off' ? (
            // Show warehouse selection for drop-off
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Collection Center
                </label>
                <div className="space-y-3">
                  {warehouseLocations.map((warehouse, index) => (
                    <label
                      key={index}
                      className={`relative flex items-start p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedWarehouse.name === warehouse.name 
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="warehouse"
                        value={index}
                        checked={selectedWarehouse.name === warehouse.name}
                        onChange={() => handleWarehouseChange(index)}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                        selectedWarehouse.name === warehouse.name 
                          ? 'border-emerald-600 bg-emerald-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedWarehouse.name === warehouse.name && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{warehouse.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{warehouse.address}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {warehouse.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Collection Center Details</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>Address:</strong> {selectedWarehouse.address}</p>
                  <p><strong>Phone:</strong> {selectedWarehouse.phone}</p>
                  <p><strong>Working Hours:</strong> Monday - Saturday, 9:00 AM - 5:00 PM</p>
                  <p className="mt-2 text-xs">Please bring a copy of your submission confirmation when visiting the center.</p>
                </div>
              </div>
            </>
          ) : (
            // Show address input for agent visit
            <>
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

              {/* Map Section for agent visit */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Pickup Location on Map
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Use Current Location
                  </button>

                  {/* OpenStreetMap Embed */}
                  <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <iframe
                      ref={mapRef}
                      width="100%"
                      height="400"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={getMapUrl()}
                      className="w-full"
                    />
                  </div>

                  {markerPosition && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Location selected: {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Note: Click "Use Current Location" to set your pickup point. For manual selection, please enter the address details above.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Map Section - Common for both */}
          {deliveryMethod === 'drop_off' && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Collection Center Location
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <iframe
                  ref={mapRef}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={getMapUrl()}
                  className="w-full"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                The map shows the location of the selected collection center.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingStep({ register, control, errors, watchedCondition }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pricing Information
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Price (LKR) *
              </label>
              <input
                {...register('expectedPrice', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.expectedPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Minimum Price (LKR) *
              </label>
              <input
                {...register('minimumPrice', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.minimumPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.minimumPrice.message}</p>
              )}
            </div>
          </div>

          <div>
            <Controller
              name="negotiable"
              control={control}
              render={({ field }) => (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Price is negotiable
                  </span>
                </label>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecificationsStep({ register, control, errors, tags, tagInput, onTagInputChange, onAddTag, onRemoveTag }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Material Specifications
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Material Type *
            </label>
            <input
              {...register('specifications.material')}
              type="text"
              placeholder="e.g., Aluminum 6061, PET Plastic, Cardboard"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.specifications?.material && (
              <p className="mt-1 text-sm text-red-600">{errors.specifications.material.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <input
                {...register('specifications.color')}
                type="text"
                placeholder="e.g., Silver, Transparent, Mixed"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand
              </label>
              <input
                {...register('specifications.brand')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-700"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => onTagInputChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                placeholder="Add tags (e.g., recyclable, clean, sorted)"
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="button"
                onClick={onAddTag}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AIAnalysisStep component removed - AI analysis is now done in background without user visibility

// AgentAssignmentStep component removed - agent assignment is no longer part of the workflow

function ReviewStep({ data, photoPreviews, deliveryMethod }: any) {
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
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Delivery Method</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.deliveryMethod === 'agent_visit' ? 'Agent will visit my location' : 'I will bring to collection center'}
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
              {photoPreviews.slice(0, 8).map((preview: string, index: number) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 dark:text-yellow-100">Ready to Submit</h5>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {deliveryMethod === 'agent_visit' ? (
                    <>Once submitted, our agent nearest to your location will contact you shortly to schedule a convenient appointment for material verification. You'll have the opportunity to discuss the best timing and arrange the verification process according to your schedule.</>
                  ) : (
                    <>Once submitted, our agent will reach out to you shortly to inform you when you should bring your material to our nearest collection center for verification. Please note that you will need to take the material back with you if it's not selected for auction.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}