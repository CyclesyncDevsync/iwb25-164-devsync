'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Material, MaterialStatus } from '@/types/supplier';
import { PriceWidget } from '@/components/pricing/PriceWidget';

interface MaterialCardWithPricingProps {
  material: Material;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export const MaterialCardWithPricing: React.FC<MaterialCardWithPricingProps> = ({
  material,
  onDelete,
  onEdit,
  onView
}) => {
  const [showPricingDetails, setShowPricingDetails] = useState(false);

  const getStatusIcon = (status: MaterialStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'inactive':
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: MaterialStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start space-x-3">
              <div className="relative">
                {material.images && material.images.length > 0 ? (
                  <img
                    src={material.images[0]}
                    alt={material.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <PhotoIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {material.verificationStatus === 'verified' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {material.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {material.description}
                </p>
                
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {material.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {material.quantity.toFixed(1)} kg
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Quality:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {material.qualityGrade}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {material.location}
                    </span>
                  </div>
                </div>

                {/* Dynamic Pricing Widget */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <PriceWidget
                      materialType={material.category.toLowerCase()}
                      quantity={material.quantity}
                      qualityScore={material.qualityGrade === 'premium' ? 90 : 
                                   material.qualityGrade === 'standard' ? 70 : 50}
                      showDetails={showPricingDetails}
                    />
                    <button
                      onClick={() => setShowPricingDetails(!showPricingDetails)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showPricingDetails ? 'Hide' : 'Show'} details
                    </button>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(material.status)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getStatusLabel(material.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/pricing?material=${material.category.toLowerCase()}&quantity=${material.quantity}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      title="View pricing analysis"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onView?.(material.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit?.(material.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Edit material"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(material.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title="Delete material"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};