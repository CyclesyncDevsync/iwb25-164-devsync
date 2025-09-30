'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import {
  PlusIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  MapPinIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArchiveBoxIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchSupplierMaterials,
  setFilters,
  setSelectedMaterial
} from '../../store/slices/supplierSlice';
import {
  Material,
  MaterialStatus,
  MaterialCategory,
  QualityGrade
} from '../../types/supplier';
import { ViewMaterialModal } from './ViewMaterialModal';

export default function MaterialManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [backendMaterials, setBackendMaterials] = useState<any[]>([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [materialToView, setMaterialToView] = useState<Material | null>(null);

  const dispatch = useAppDispatch();
  const { materials, loading, pagination, filters } = useAppSelector(state => state.supplier);

  useEffect(() => {
    // Fetch materials from the backend API
    const fetchMaterials = async () => {
      try {
        // Don't fetch if user is not loaded yet
        if (!user) {
          console.log('Waiting for user authentication...');
          return;
        }
        
        setIsLoadingBackend(true);
        // Get supplier ID from auth context or localStorage as fallback
        // Using the same test ID that's in the submission form
        const supplierId = user.asgardeoId || user.id || localStorage.getItem('supplierId') || '103ad4f1-8def-43e5-b72f-aa4c6d306bf4';
        
        console.log('User object:', user);
        console.log('Attempting to fetch with supplierId:', supplierId);
        
        if (!supplierId) {
          console.warn('No supplier ID found. User may need to log in again.');
          setIsLoadingBackend(false);
          return;
        }

        const response = await fetch(`http://localhost:8086/api/material/workflow/submissions/${supplierId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // The backend returns {supplierId, submissions, count}
          const materialsArray = data.submissions || [];
          
          // Transform the backend data to match the frontend Material type structure
          const transformedMaterials = materialsArray.map((submission: any) => ({
            id: submission.id || submission.transaction_id,
            title: submission.title,
            description: submission.description,
            category: submission.category,
            subCategory: submission.sub_category,
            quantity: submission.quantity,
            unit: submission.unit,
            condition: submission.condition ? submission.condition.toLowerCase() as QualityGrade : QualityGrade.GOOD,
            pricing: {
              expectedPrice: submission.expected_price || 150,
              minimumPrice: submission.minimum_price || 150,
              pricePerUnit: 0,
              currency: 'LKR',
              negotiable: submission.negotiable || true
            },
            status: (submission.submission_status || 'pending_review') as MaterialStatus,
            location: {
              address: submission.location_address,
              city: submission.location_city,
              district: submission.location_district,
              coordinates: {
                latitude: submission.location_latitude,
                longitude: submission.location_longitude
              }
            },
            photos: (() => {
              let photosArray = [];
              if (submission.photos) {
                // Handle case where photos might be a JSON string
                if (typeof submission.photos === 'string') {
                  try {
                    photosArray = JSON.parse(submission.photos);
                  } catch (e) {
                    console.error('Failed to parse photos JSON:', e);
                    photosArray = [];
                  }
                } else if (Array.isArray(submission.photos)) {
                  photosArray = submission.photos;
                } else {
                  console.warn('Unexpected photos format:', submission.photos);
                  photosArray = [];
                }
              }
              
              return photosArray.map((photo: any, index: number) => ({
                id: `${submission.id || submission.transaction_id}_photo_${index}`,
                url: photo.data, // This already contains the data:image format
                filename: photo.filename || 'photo.jpg',
                size: 0, // Not provided by backend
                mimeType: photo.type || 'image/jpeg',
                isMain: index === 0, // First photo is main
                uploadedAt: new Date().toISOString() // Convert to string for Redux serialization
              }));
            })(),
            createdAt: submission.created_at,
            updatedAt: submission.updated_at,
            deliveryMethod: submission.delivery_method,
            tags: submission.tags || []
          }));
          
          setBackendMaterials(transformedMaterials);
        } else {
          console.error('Failed to fetch materials. Status:', response.status);
          try {
            const errorData = await response.json();
            console.error('Error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
        }
      } catch (error) {
        console.error('Failed to fetch materials:', error);
      } finally {
        setIsLoadingBackend(false);
      }
    };

    fetchMaterials();
    
    // Comment out Redux fetch for now since we're using backend directly
    // dispatch(fetchSupplierMaterials({
    //   page: pagination.currentPage,
    //   limit: pagination.limit,
    //   status: filters.status !== 'all' ? filters.status : undefined
    // }));
  }, [dispatch, pagination.currentPage, pagination.limit, filters.status, user]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };


  // Use backend materials instead of Redux materials
  const filteredMaterials = backendMaterials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Materials</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your material listings and track their performance
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link
            href="/supplier/materials/new-enhanced"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Material
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <MaterialFilters filters={filters} onFilterChange={handleFilterChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      {/* Materials Grid */}
      {isLoadingBackend ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <MaterialCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onView={() => {
                setMaterialToView(material);
                setShowViewModal(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState searchTerm={searchTerm} />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => {
            // Handle page change
          }}
        />
      )}


      {/* View Material Modal */}
      <ViewMaterialModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setMaterialToView(null);
        }}
        material={materialToView}
      />
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  onView: () => void;
}

function MaterialCard({ material, onView }: MaterialCardProps) {
  const getStatusColor = (status: string) => {
    // Map backend statuses to colors
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending_verification':
      case MaterialStatus.PENDING_REVIEW:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'assigned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'confirmed':
      case 'approved':
      case MaterialStatus.APPROVED:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'verified':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
      case 'rejected':
      case MaterialStatus.REJECTED:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400';
      case 'in_auction':
      case MaterialStatus.IN_AUCTION:
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400';
      case 'sold':
      case MaterialStatus.SOLD:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400';
      case 'archived':
      case MaterialStatus.ARCHIVED:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
      case MaterialStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending_verification':
      case MaterialStatus.PENDING_REVIEW:
        return <ClockIcon className="h-4 w-4" />;
      case 'assigned':
        return <UserIcon className="h-4 w-4" />;
      case 'confirmed':
      case 'approved':
      case MaterialStatus.APPROVED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'verified':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'rejected':
      case MaterialStatus.REJECTED:
        return <XCircleIcon className="h-4 w-4" />;
      case 'in_auction':
      case MaterialStatus.IN_AUCTION:
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'sold':
      case MaterialStatus.SOLD:
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'archived':
      case MaterialStatus.ARCHIVED:
        return <ArchiveBoxIcon className="h-4 w-4" />;
      case MaterialStatus.DRAFT:
        return <PencilIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const mainPhoto = material.photos.find(photo => photo.isMain) || material.photos[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      {/* Header with status */}
      <div className="p-4 flex items-center justify-end">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
          {getStatusIcon(material.status)}
          <span className="ml-1 capitalize">{material.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {mainPhoto ? (
          <img
            src={mainPhoto.url}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {material.photos.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            +{material.photos.length - 1} more
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
          {material.title}
        </h3>
        
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {material.description}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{material.quantity} {material.unit}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{material.category}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <TruckIcon className="h-4 w-4 mr-1" />
            <span className="capitalize">{material.deliveryMethod?.replace('_', ' ') || 'Not specified'}</span>
          </div>
        </div>

        {/* Quality Grade */}
        <div className="mt-3">
          <QualityBadge grade={material.condition} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={onView}
          className="w-full inline-flex justify-center items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </motion.div>
  );
}

interface QualityBadgeProps {
  grade: QualityGrade;
}

export function QualityBadge({ grade }: QualityBadgeProps) {
  const gradeConfig = {
    [QualityGrade.EXCELLENT]: {
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 ring-1 ring-emerald-600/20',
      icon: '⭐',
      label: 'Excellent'
    },
    [QualityGrade.GOOD]: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-blue-600/20',
      icon: '✅',
      label: 'Good'
    },
    [QualityGrade.FAIR]: {
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-600/20',
      icon: '⚠️',
      label: 'Fair'
    },
    [QualityGrade.POOR]: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-red-600/20',
      icon: '❌',
      label: 'Poor'
    }
  };

  const config = gradeConfig[grade] || {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 ring-1 ring-gray-600/20',
    icon: '❓',
    label: grade || 'Unknown'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}

interface MaterialFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

function MaterialFilters({ filters, onFilterChange }: MaterialFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Statuses</option>
          {Object.values(MaterialStatus).map(status => (
            <option key={status} value={status}>
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Categories</option>
          {Object.values(MaterialCategory).map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Range
        </label>
        <select
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
    </div>
  );
}

function MaterialCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="p-4 flex items-center justify-between">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      
      <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
      
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  searchTerm: string;
}

function EmptyState({ searchTerm }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {searchTerm ? 'No materials found' : 'No materials yet'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {searchTerm 
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Get started by adding your first material listing.'
        }
      </p>
      {!searchTerm && (
        <div className="mt-6">
          <Link
            href="/supplier/materials/new-enhanced"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add your first material
          </Link>
        </div>
      )}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${page === 1 ? 'rounded-l-md' : ''} ${page === totalPages ? 'rounded-r-md' : ''}`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

