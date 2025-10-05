'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Material, MaterialStatus } from '../../types/supplier';
import { QualityBadge } from './MaterialManagement';

interface ViewMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export function ViewMaterialModal({ isOpen, onClose, material }: ViewMaterialModalProps) {
  // Only render the modal overlay & panel when requested open.
  if (!isOpen) return null;

  const status = material ? (material.status as unknown as string) : '';

  return (
    // Top-level fixed element with a very high z-index so it appears above navbars
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[99999]">
      <AnimatePresence>
        {/* overlay */}
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-black/20 z-[99998]"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative z-[100000] mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.985, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 6 }}
              transition={{ duration: 0.18 }}
            >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">Material Details</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {!material ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading material details…</p>
              </div>
            ) : (
              <>
                {/* Photos */}
                {material.photos && material.photos.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Photos</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {material.photos.map((photo, index) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url}
                            alt={`${material.title} - Photo ${index + 1}`}
                            className="h-32 w-full object-cover rounded-lg"
                          />
                          {photo.isMain && (
                            <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">Main</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          status === MaterialStatus.DRAFT
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            : status === MaterialStatus.PENDING_REVIEW || status === 'pending_verification'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                            : status === MaterialStatus.APPROVED || status === 'approved' || status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : status === MaterialStatus.REJECTED
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                            : status === MaterialStatus.IN_AUCTION
                            ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400'
                            : status === MaterialStatus.SOLD
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400'
                            : status === MaterialStatus.ARCHIVED
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400'
                            : status === 'submitted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : status === 'assigned'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : status === 'verified'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}
                        >
                          {material.status.replace('_', ' ')}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{material.category} - {material.subCategory}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.quantity} {material.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</dt>
                      <dd className="mt-1"><QualityBadge grade={material.condition} /></dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Method</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{material.deliveryMethod?.replace('_', ' ') || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Description */}
                {material.description && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Description</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{material.description}</p>
                  </div>
                )}

                {/* Pricing */}
                {material.pricing && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Pricing Information</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Price</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.pricing.currency} {material.pricing.expectedPrice.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum Price</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.pricing.currency} {material.pricing.minimumPrice.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Negotiable</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.pricing.negotiable ? 'Yes' : 'No'}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {/* Location */}
                {material.location && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Location</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{material.location.address}<br />{material.location.city}, {material.location.district}</p>
                    {material.location.coordinates && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Coordinates: {material.location.coordinates.lat}, {material.location.coordinates.lng}</p>
                    )}
                  </div>
                )}

                {/* Specifications */}
                {material.specifications && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Specifications</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {material.specifications.dimensions && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.dimensions.length} x {material.specifications.dimensions.width} x {material.specifications.dimensions.height} cm</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.dimensions.weight} kg</dd>
                          </div>
                        </>
                      )}
                      {material.specifications.material && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Material Type</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.material}</dd>
                        </div>
                      )}
                      {material.specifications.color && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.color}</dd>
                        </div>
                      )}
                      {material.specifications.brand && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.brand}</dd>
                        </div>
                      )}
                      {material.specifications.model && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.specifications.model}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Tags */}
                {material.tags && material.tags.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {material.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Timeline</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(material.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(material.updatedAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
          </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 rounded-b-lg">
              <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-colors">Close</button>
            </div>
            </motion.div>
          </Dialog.Panel>
        </div>
      </AnimatePresence>
    </Dialog>
  );
}