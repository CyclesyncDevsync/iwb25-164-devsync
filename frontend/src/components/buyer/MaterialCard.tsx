 'use client';

import React from 'react';
import { Material as BuyerMaterial } from '@/types/buyer';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  BookmarkIcon,
  StarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon, 
  BookmarkIcon as BookmarkSolidIcon 
} from '@heroicons/react/24/solid';

interface MaterialCardProps {
  material: BuyerMaterial;
  viewMode: 'grid' | 'list';
  onLike: (materialId: string) => void;
  onSave: (materialId: string) => void;
  onViewDetails: (material: BuyerMaterial) => void;
  onContact: (material: BuyerMaterial) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  viewMode,
  onLike,
  onSave,
  onViewDetails,
  onContact
}) => {
  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            Unverified
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Image */}
      <div className={`${
        viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48'
      } bg-gray-200 rounded-t-lg ${
        viewMode === 'list' ? 'rounded-l-lg rounded-t-none' : ''
      } relative overflow-hidden`}>
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => onLike(material.id)}
            className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            {material.isLiked ? (
              <HeartSolidIcon className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => onSave(material.id)}
            className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            {material.isSaved ? (
              <BookmarkSolidIcon className="h-4 w-4 text-purple-500" />
            ) : (
              <BookmarkIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Verification Badge */}
        <div className="absolute top-2 left-2">
          {getVerificationBadge(material.verificationStatus)}
        </div>

        {/* Auction Badge */}
        {material.isAuction && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium animate-pulse">
              Live Auction
            </span>
          </div>
        )}

        {/* Placeholder for image */}
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">{material.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{material.title}</h3>
          <span className="text-lg font-bold text-purple-600 whitespace-nowrap ml-2">
            ₹{material.price}/{material.unit}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {material.category}
            </span>
            <div className="flex items-center gap-1">
              <StarIcon className={`h-4 w-4 ${getQualityColor(material.quality)}`} />
              <span className={`text-sm font-medium ${getQualityColor(material.quality)}`}>
                {material.quality}/10
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4" />
            <span>{material.location} • {material.distance}km away</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Available:</span> {material.availableQuantity} {material.unit}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Supplier:</span> {material.supplier?.name || ''}
          </div>

          {material.isAuction && material.auctionEndTime && (
            <div className="text-sm text-red-600 font-medium">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Auction ends: {new Date(material.auctionEndTime).toLocaleString()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(material)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
          >
            {material.isAuction ? 'Join Auction' : 'View Details'}
          </button>
          <button
            onClick={() => onContact(material)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm"
          >
            Contact
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MaterialCard;
