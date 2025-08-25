import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Clock, 
  Image as ImageIcon,
  MapPin,
  Package,
  Tag,
  Info,
  CheckCircle,
  AlertTriangle,
  Upload,
  X
} from 'lucide-react';
import { AuctionType, CreateAuctionRequest } from '@/types/auction';
import { MATERIAL_CATEGORIES } from '@/constants/index';
import { AuctionApiService } from '@/services/auctionApi';
import { formatCurrency } from '@/utils/formatters';

// Validation schema
const auctionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['standard', 'buy_it_now', 'reserve', 'dutch', 'bulk']),
  materialId: z.string().min(1, 'Material is required'),
  materialCategory: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().min(1, 'Location is required'),
  startingPrice: z.number().min(0.01, 'Starting price must be greater than 0'),
  reservePrice: z.number().optional(),
  buyItNowPrice: z.number().optional(),
  incrementAmount: z.number().min(0.01, 'Increment amount must be greater than 0'),
  startTime: z.date().min(new Date(), 'Start time must be in the future'),
  endTime: z.date(),
  timeExtension: z.number().min(0).max(60).optional(),
  
  // Dutch auction specific
  decrementAmount: z.number().optional(),
  decrementInterval: z.number().optional(),
  minimumPrice: z.number().optional(),
  
  // Bulk auction specific
  minQuantityPerBid: z.number().optional(),
  maxQuantityPerBid: z.number().optional(),
  bulkDiscountPercentage: z.number().optional(),
}).refine((data) => {
  return data.endTime > data.startTime;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine((data) => {
  if (data.type === 'reserve' && !data.reservePrice) {
    return false;
  }
  return true;
}, {
  message: 'Reserve price is required for reserve auctions',
  path: ['reservePrice'],
}).refine((data) => {
  if (data.type === 'buy_it_now' && !data.buyItNowPrice) {
    return false;
  }
  return true;
}, {
  message: 'Buy It Now price is required for Buy It Now auctions',
  path: ['buyItNowPrice'],
}).refine((data) => {
  if (data.type === 'dutch') {
    return data.decrementAmount && data.decrementInterval && data.minimumPrice;
  }
  return true;
}, {
  message: 'Dutch auction requires decrement amount, interval, and minimum price',
  path: ['decrementAmount'],
}).refine((data) => {
  if (data.type === 'bulk') {
    return data.minQuantityPerBid && data.maxQuantityPerBid;
  }
  return true;
}, {
  message: 'Bulk auction requires minimum and maximum quantity per bid',
  path: ['minQuantityPerBid'],
});

type AuctionFormData = z.infer<typeof auctionSchema>;

interface AuctionWizardProps {
  onComplete?: (auction: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateAuctionRequest>;
}

const AuctionWizard: React.FC<AuctionWizardProps> = ({
  onComplete,
  onCancel,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { errors, isValid },
    setValue,
    getValues,
    trigger
  } = useForm<AuctionFormData>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      type: 'standard',
      incrementAmount: 10,
      timeExtension: 5,
      startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      ...initialData,
    },
    mode: 'onChange'
  });

  const watchedType = watch('type');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

  // Generate preview URLs for images
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const steps = [
    {
      title: 'Basic Information',
      description: 'Tell us about your auction item',
      icon: Info,
      fields: ['title', 'description', 'materialCategory', 'location']
    },
    {
      title: 'Auction Type & Details',
      description: 'Choose your auction format',
      icon: Tag,
      fields: ['type', 'quantity', 'unit']
    },
    {
      title: 'Pricing',
      description: 'Set your pricing strategy',
      icon: DollarSign,
      fields: ['startingPrice', 'reservePrice', 'buyItNowPrice', 'incrementAmount']
    },
    {
      title: 'Schedule',
      description: 'When should your auction run?',
      icon: Calendar,
      fields: ['startTime', 'endTime', 'timeExtension']
    },
    {
      title: 'Images',
      description: 'Add photos of your item',
      icon: ImageIcon,
      fields: []
    },
    {
      title: 'Review',
      description: 'Review and submit your auction',
      icon: CheckCircle,
      fields: []
    }
  ];

  const handleNext = async () => {
    const currentFields = steps[currentStep].fields;
    const isStepValid = await trigger(currentFields as any);
    
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    setImages(prev => [...prev, ...validFiles].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: AuctionFormData) => {
    setIsSubmitting(true);
    
    try {
      // Here you would upload images first and get URLs
      const imageUrls: string[] = []; // Replace with actual upload logic
      
      const auctionData: CreateAuctionRequest = {
        ...data,
        materialId: 'temp-material-id', // This should come from material selection
      };
      
      const result = await AuctionApiService.createAuction(auctionData);
      onComplete?.(result);
    } catch (error) {
      console.error('Failed to create auction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const auctionTypes = [
    {
      type: 'standard' as AuctionType,
      title: 'Standard Auction',
      description: 'Traditional bidding where highest bid wins',
      icon: '🔨'
    },
    {
      type: 'buy_it_now' as AuctionType,
      title: 'Buy It Now',
      description: 'Allow immediate purchase at fixed price',
      icon: '⚡'
    },
    {
      type: 'reserve' as AuctionType,
      title: 'Reserve Auction',
      description: 'Set minimum price that must be met',
      icon: '👑'
    },
    {
      type: 'dutch' as AuctionType,
      title: 'Dutch Auction',
      description: 'Price decreases over time until someone buys',
      icon: '📉'
    },
    {
      type: 'bulk' as AuctionType,
      title: 'Bulk Auction',
      description: 'Sell large quantities with bulk discounts',
      icon: '📦'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Title *
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a descriptive title for your auction"
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your item in detail..."
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Controller
                name="materialCategory"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {MATERIAL_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                )}
              />
              {errors.materialCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.materialCategory.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup location"
                    />
                  </div>
                )}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>
        );

      case 1: // Auction Type & Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Auction Type *
              </label>
              <div className="grid grid-cols-1 gap-4">
                {auctionTypes.map((auctionType) => (
                  <Controller
                    key={auctionType.type}
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <label
                        className={`
                          relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200
                          ${field.value === auctionType.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={auctionType.type}
                          checked={field.value === auctionType.type}
                          onChange={field.onChange}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{auctionType.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{auctionType.title}</div>
                            <div className="text-sm text-gray-600">{auctionType.description}</div>
                          </div>
                        </div>
                        {field.value === auctionType.type && (
                          <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-blue-500" />
                        )}
                      </label>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity"
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select unit</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="tons">Tons</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="pallets">Pallets</option>
                    </select>
                  )}
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Type-specific fields */}
            {watchedType === 'bulk' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Quantity Per Bid
                  </label>
                  <Controller
                    name="minQuantityPerBid"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Quantity Per Bid
                  </label>
                  <Controller
                    name="maxQuantityPerBid"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Pricing
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Price *
              </label>
              <Controller
                name="startingPrice"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="number"
                      min="0.01"
                      step="0.01"
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                )}
              />
              {errors.startingPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.startingPrice.message}</p>
              )}
            </div>

            {(watchedType === 'reserve' || watchedType === 'standard') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price {watchedType === 'reserve' && '*'}
                </label>
                <Controller
                  name="reservePrice"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...field}
                        type="number"
                        min="0.01"
                        step="0.01"
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                />
                {errors.reservePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.reservePrice.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-600">
                  Minimum price you're willing to accept
                </p>
              </div>
            )}

            {(watchedType === 'buy_it_now' || watchedType === 'standard') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy It Now Price {watchedType === 'buy_it_now' && '*'}
                </label>
                <Controller
                  name="buyItNowPrice"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...field}
                        type="number"
                        min="0.01"
                        step="0.01"
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                />
                {errors.buyItNowPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.buyItNowPrice.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bid Increment Amount *
              </label>
              <Controller
                name="incrementAmount"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="number"
                      min="0.01"
                      step="0.01"
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10.00"
                    />
                  </div>
                )}
              />
              {errors.incrementAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.incrementAmount.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-600">
                Minimum amount each bid must increase
              </p>
            </div>

            {/* Dutch auction specific pricing */}
            {watchedType === 'dutch' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900">Dutch Auction Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Decrement Amount *
                    </label>
                    <Controller
                      name="decrementAmount"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...field}
                            type="number"
                            min="0.01"
                            step="0.01"
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decrement Interval (minutes) *
                    </label>
                    <Controller
                      name="decrementInterval"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5"
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Price *
                  </label>
                  <Controller
                    name="minimumPrice"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...field}
                          type="number"
                          min="0.01"
                          step="0.01"
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Schedule
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    value={field.value ? field.value.toISOString().slice(0, -1) : ''}
                    onChange={e => field.onChange(new Date(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="datetime-local"
                    value={field.value ? field.value.toISOString().slice(0, -1) : ''}
                    onChange={e => field.onChange(new Date(e.target.value))}
                    min={watchedStartTime ? watchedStartTime.toISOString().slice(0, -1) : ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Extension Time (minutes)
              </label>
              <Controller
                name="timeExtension"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    max="60"
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5"
                  />
                )}
              />
              <p className="mt-1 text-sm text-gray-600">
                Automatically extend auction by this many minutes if bid is placed in final minutes
              </p>
            </div>

            {/* Duration display */}
            {watchedStartTime && watchedEndTime && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Auction Duration</span>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  {Math.ceil((watchedEndTime.getTime() - watchedStartTime.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Images
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload Images
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, GIF up to 5MB each (max 10 images)
                  </p>
                </label>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Uploaded Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Review
        const formData = getValues();
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Review Your Auction</h3>
              <p className="text-gray-600">Please review all details before submitting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Title:</span> {formData.title}</div>
                  <div><span className="text-gray-600">Category:</span> {formData.materialCategory}</div>
                  <div><span className="text-gray-600">Location:</span> {formData.location}</div>
                  <div><span className="text-gray-600">Quantity:</span> {formData.quantity} {formData.unit}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Auction Details</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Type:</span> {formData.type.replace('_', ' ')}</div>
                  <div><span className="text-gray-600">Starting Price:</span> {formatCurrency(formData.startingPrice)}</div>
                  {formData.reservePrice && (
                    <div><span className="text-gray-600">Reserve Price:</span> {formatCurrency(formData.reservePrice)}</div>
                  )}
                  {formData.buyItNowPrice && (
                    <div><span className="text-gray-600">Buy It Now:</span> {formatCurrency(formData.buyItNowPrice)}</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Start:</span> {formData.startTime?.toLocaleString()}</div>
                  <div><span className="text-gray-600">End:</span> {formData.endTime?.toLocaleString()}</div>
                  <div><span className="text-gray-600">Auto-Extension:</span> {formData.timeExtension || 0} minutes</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Images</h4>
                <div className="text-sm text-gray-600">
                  {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-2 flex space-x-2">
                    {previewUrls.slice(0, 3).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ))}
                    {previewUrls.length > 3 && (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-600">
                        +{previewUrls.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Auction</h1>
        <p className="text-gray-600">Follow the steps below to list your item for auction</p>
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200
                  ${index <= currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                  }
                `}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-2 transition-colors duration-200
                    ${index < currentStep ? 'bg-blue-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={currentStep === 0 ? onCancel : handlePrev}
          className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 0 ? 'Cancel' : 'Previous'}</span>
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleFormSubmit(handleSubmit)}
            disabled={!isValid || isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Auction...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Auction</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AuctionWizard;
