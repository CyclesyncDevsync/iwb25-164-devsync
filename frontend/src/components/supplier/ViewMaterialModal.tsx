import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Material, MaterialStatus } from '../../types/supplier';
import { QualityBadge } from './MaterialManagement';

interface ViewMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export function ViewMaterialModal({ isOpen, onClose, material }: ViewMaterialModalProps) {
  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Material Details
              </h3>
              <button
                onClick={onClose}
                className="ml-auto bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Basic Information</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        material.status === MaterialStatus.DRAFT
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          : material.status === MaterialStatus.PENDING_REVIEW
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                          : material.status === MaterialStatus.APPROVED
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : material.status === MaterialStatus.REJECTED
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                          : material.status === MaterialStatus.IN_AUCTION
                          ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400'
                          : material.status === MaterialStatus.SOLD
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400'
                          : material.status === MaterialStatus.ARCHIVED
                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {material.status.replace('_', ' ')}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {material.category} - {material.subCategory}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {material.quantity} {material.unit}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</dt>
                    <dd className="mt-1">
                      <QualityBadge grade={material.condition} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Method</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {material.deliveryMethod?.replace('_', ' ') || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Description */}
              {material.description && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{material.description}</p>
                </div>
              )}


              {/* Location */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Location</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {material.location.address}<br />
                  {material.location.city}, {material.location.district}
                </p>
              </div>

              {/* Photos */}
              {material.photos.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Photos</h4>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {material.photos.map((photo, index) => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={`${material.title} - Photo ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        {photo.isMain && (
                          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}