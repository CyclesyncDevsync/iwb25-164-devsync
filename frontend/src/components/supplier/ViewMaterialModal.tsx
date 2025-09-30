'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Material } from '../../types/supplier';

interface ViewMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material;
}

export default function ViewMaterialModal({ isOpen, onClose, material }: ViewMaterialModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Material Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Photos */}
            {material.photos && material.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {material.photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={`${material.title} - Photo ${index + 1}`}
                      className="rounded-lg object-cover h-48 w-full"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{material.title}</dd>
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
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {material.condition || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {material.deliveryMethod || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                    {material.status.replace('_', ' ')}
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Description */}
            {material.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{material.description}</p>
              </div>
            )}
            
            {/* Specifications */}
            {material.specifications && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {material.specifications.dimensions && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {material.specifications.dimensions.length} x {material.specifications.dimensions.width} x {material.specifications.dimensions.height} cm
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                          {material.specifications.dimensions.weight} kg
                        </dd>
                      </div>
                    </>
                  )}
                  {material.specifications.material && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Material Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {material.specifications.material}
                      </dd>
                    </div>
                  )}
                  {material.specifications.color && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {material.specifications.color}
                      </dd>
                    </div>
                  )}
                  {material.specifications.brand && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {material.specifications.brand}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
            
            {/* Timestamps */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Timeline</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(material.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}