'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchSupplierMaterials,
  deleteMaterial,
  setFilters,
  setSelectedMaterial
} from '../../store/slices/supplierSlice';
import {
  Material,
  MaterialStatus,
  MaterialCategory,
  QualityGrade
} from '../../types/supplier';

export default function MaterialManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { materials, loading, pagination, filters } = useAppSelector(state => state.supplier);

  useEffect(() => {
    dispatch(fetchSupplierMaterials({
      page: pagination.currentPage,
      limit: pagination.limit,
      status: filters.status !== 'all' ? filters.status : undefined
    }));
  }, [dispatch, pagination.currentPage, pagination.limit, filters.status]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handleDelete = async (materialId: string) => {
    try {
      await dispatch(deleteMaterial(materialId)).unwrap();
      setShowDeleteModal(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error('Failed to delete material:', error);
    }
  };

  const handleBulkDelete = async () => {
    // Implement bulk delete logic
    console.log('Bulk delete:', selectedItems);
  };

  const filteredMaterials = materials.filter(material =>
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
            href="/supplier/materials/new"
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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-400">
              {selectedItems.length} item(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Materials Grid */}
      {loading.materials ? (
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
              isSelected={selectedItems.includes(material.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedItems([...selectedItems, material.id]);
                } else {
                  setSelectedItems(selectedItems.filter(id => id !== material.id));
                }
              }}
              onView={() => dispatch(setSelectedMaterial(material))}
              onEdit={() => {
                // Navigate to edit page
                window.location.href = `/supplier/materials/${material.id}/edit`;
              }}
              onDelete={() => {
                setMaterialToDelete(material.id);
                setShowDeleteModal(true);
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => materialToDelete && handleDelete(materialToDelete)}
        materialTitle={materials.find(m => m.id === materialToDelete)?.title || ''}
      />
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function MaterialCard({ material, isSelected, onSelect, onView, onEdit, onDelete }: MaterialCardProps) {
  const getStatusColor = (status: MaterialStatus) => {
    switch (status) {
      case MaterialStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case MaterialStatus.PENDING_REVIEW:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case MaterialStatus.IN_AUCTION:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case MaterialStatus.SOLD:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case MaterialStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: MaterialStatus) => {
    switch (status) {
      case MaterialStatus.APPROVED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case MaterialStatus.PENDING_REVIEW:
        return <ClockIcon className="h-4 w-4" />;
      case MaterialStatus.REJECTED:
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const mainPhoto = material.photos.find(photo => photo.isMain) || material.photos[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
        isSelected ? 'ring-2 ring-emerald-500' : ''
      }`}
    >
      {/* Header with selection checkbox */}
      <div className="p-4 flex items-center justify-between">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
        />
        
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
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            <span>LKR {material.pricing.expectedPrice.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="truncate">{material.location.city}, {material.location.district}</span>
          </div>
        </div>

        {/* Quality Grade */}
        <div className="mt-3">
          <QualityBadge grade={material.condition} />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={onView}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </button>
            
            <button
              onClick={onEdit}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
          
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface QualityBadgeProps {
  grade: QualityGrade;
}

function QualityBadge({ grade }: QualityBadgeProps) {
  const gradeConfig = {
    [QualityGrade.EXCELLENT]: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      label: 'Excellent'
    },
    [QualityGrade.GOOD]: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      label: 'Good'
    },
    [QualityGrade.FAIR]: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      label: 'Fair'
    },
    [QualityGrade.POOR]: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      label: 'Poor'
    }
  };

  const config = gradeConfig[grade];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
            href="/supplier/materials/new"
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

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  materialTitle: string;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, materialTitle }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Delete Material
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete "{materialTitle}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
