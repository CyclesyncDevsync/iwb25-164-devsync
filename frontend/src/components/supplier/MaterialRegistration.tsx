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
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import {
  MaterialCategory,
  QualityGrade,
  MaterialRegistrationForm,
  SupplierType
} from '../../types/supplier';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createMaterial, saveDraft } from '../../store/slices/supplierSlice';

const materialSchema = z.object({
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
    postalCode: z.string().optional()
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

type MaterialFormData = z.infer<typeof materialSchema>;

const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Material details and category' },
  { id: 'photos', title: 'Photos', description: 'Upload material photos' },
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

interface MaterialRegistrationProps {
  onComplete?: (material: MaterialRegistrationForm) => void;
  initialData?: Partial<MaterialRegistrationForm>;
}

export default function MaterialRegistration({ onComplete, initialData }: MaterialRegistrationProps) {
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
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
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

  const getStepFields = (step: number): (keyof MaterialFormData)[] => {
    switch (step) {
      case 0: return ['title', 'description', 'category', 'subCategory', 'quantity', 'unit', 'condition'];
      case 1: return ['photos'];
      case 2: return ['location'];
      case 3: return ['expectedPrice', 'minimumPrice', 'negotiable'];
      case 4: return ['specifications'];
      default: return [];
    }
  };

  // Save draft
  const saveDraftHandler = () => {
    const formData = getValues();
    dispatch(saveDraft(formData as MaterialRegistrationForm));
  };

  // Submit handler
  const onSubmit = async (data: MaterialFormData) => {
    try {
      await dispatch(createMaterial(data as MaterialRegistrationForm)).unwrap();
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
            {/* Step Content */}
            {currentStep === 0 && (
              <BasicInformationStep
                register={register}
                control={control}
                errors={errors}
                watchedCategory={watchedCategory}
              />
            )}

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

            {currentStep === 2 && (
              <LocationStep
                register={register}
                control={control}
                errors={errors}
              />
            )}

            {currentStep === 3 && (
              <PricingStep
                register={register}
                control={control}
                errors={errors}
                watchedCondition={watchedCondition}
              />
            )}

            {currentStep === 4 && (
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
            <button
              type="button"
              onClick={saveDraftHandler}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Save Draft
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
                    Creating...
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

// Step Components
interface BasicInformationStepProps {
  register: any;
  control: any;
  errors: any;
  watchedCategory: MaterialCategory;
}

function BasicInformationStep({ register, control, errors, watchedCategory }: BasicInformationStepProps) {
  return (
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
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
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
                <option value="cubic_meters">Cubic Meters</option>
                <option value="square_meters">Square Meters</option>
                <option value="bundles">Bundles</option>
                <option value="boxes">Boxes</option>
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
  );
}

interface PhotoUploadStepProps {
  uploadedPhotos: File[];
  photoPreviews: string[];
  isDragActive: boolean;
  onFileUpload: (files: FileList | null) => void;
  onRemovePhoto: (index: number) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  errors: any;
}

function PhotoUploadStep({
  uploadedPhotos,
  photoPreviews,
  isDragActive,
  onFileUpload,
  onRemovePhoto,
  onDragEnter,
  onDragLeave,
  onDrop,
  errors
}: PhotoUploadStepProps) {
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

interface LocationStepProps {
  register: any;
  control: any;
  errors: any;
}

function LocationStep({ register, control, errors }: LocationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pickup Location
        </h3>
        
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}

interface PricingStepProps {
  register: any;
  control: any;
  errors: any;
  watchedCondition: QualityGrade;
}

function PricingStep({ register, control, errors, watchedCondition }: PricingStepProps) {
  const getSuggestedPriceRange = (condition: QualityGrade) => {
    switch (condition) {
      case QualityGrade.EXCELLENT: return { min: 80, max: 100 };
      case QualityGrade.GOOD: return { min: 60, max: 85 };
      case QualityGrade.FAIR: return { min: 40, max: 65 };
      case QualityGrade.POOR: return { min: 20, max: 45 };
      default: return { min: 20, max: 100 };
    }
  };

  const priceRange = getSuggestedPriceRange(watchedCondition);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pricing Information
        </h3>
        
        {watchedCondition && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Suggested price range for {watchedCondition} condition:</strong> 
              {' '}LKR {priceRange.min} - {priceRange.max} per unit
            </p>
          </div>
        )}

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

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pricing Tips
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Research market prices for similar materials</li>
              <li>• Consider material condition and quality</li>
              <li>• Factor in pickup and transportation costs</li>
              <li>• Set competitive but fair prices</li>
              <li>• Enable negotiation for better deals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SpecificationsStepProps {
  register: any;
  control: any;
  errors: any;
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

function SpecificationsStep({
  register,
  control,
  errors,
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag
}: SpecificationsStepProps) {
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddTag();
    }
  };

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
                placeholder="e.g., Coca-Cola, Samsung"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Model
              </label>
              <input
                {...register('specifications.model')}
                type="text"
                placeholder="Model number or type"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Manufacturing Year
              </label>
              <input
                {...register('specifications.manufacturingYear', { valueAsNumber: true })}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Dimensions (Optional)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">
                  Length (cm)
                </label>
                <input
                  {...register('specifications.dimensions.length', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">
                  Width (cm)
                </label>
                <input
                  {...register('specifications.dimensions.width', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">
                  Height (cm)
                </label>
                <input
                  {...register('specifications.dimensions.height', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">
                  Weight (kg)
                </label>
                <input
                  {...register('specifications.dimensions.weight', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
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
                onKeyPress={handleTagKeyPress}
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

          {/* Estimated Pickup Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estimated Pickup Date
            </label>
            <Controller
              name="estimatedPickupDate"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewStepProps {
  data: MaterialFormData;
  photoPreviews: string[];
}

function ReviewStep({ data, photoPreviews }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Review Your Material
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
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
                <dt className="text-gray-600 dark:text-gray-400">Condition</dt>
                <dd className="font-medium text-gray-900 dark:text-white capitalize">
                  {data.condition}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <dt className="text-gray-600 dark:text-gray-400">Description</dt>
              <dd className="mt-1 text-gray-900 dark:text-white">{data.description}</dd>
            </div>
          </div>

          {/* Photos */}
          <div>
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

          {/* Location */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Location</h4>
            <p className="text-sm text-gray-900 dark:text-white">
              {data.location.address}, {data.location.city}, {data.location.district}, {data.location.province}
              {data.location.postalCode && ` ${data.location.postalCode}`}
            </p>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Pricing</h4>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Expected Price</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  LKR {data.expectedPrice?.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Minimum Price</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  LKR {data.minimumPrice?.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Negotiable</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.negotiable ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Specifications */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Specifications</h4>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Material Type</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.specifications.material}
                </dd>
              </div>
              {data.specifications.color && (
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Color</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {data.specifications.color}
                  </dd>
                </div>
              )}
              {data.specifications.brand && (
                <div>
                  <dt className="text-gray-600 dark:text-gray-400">Brand</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {data.specifications.brand}
                  </dd>
                </div>
              )}
            </dl>
            
            {data.tags.length > 0 && (
              <div className="mt-4">
                <dt className="text-gray-600 dark:text-gray-400 mb-2">Tags</dt>
                <div className="flex flex-wrap gap-1">
                  {data.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {data.estimatedPickupDate && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Pickup Date</h4>
              <p className="text-sm text-gray-900 dark:text-white">
                {data.estimatedPickupDate.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
