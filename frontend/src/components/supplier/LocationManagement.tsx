'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  PhoneIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  specialInstructions?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
  materialTypes: string[];
  storageCapacity: number;
  currentUtilization: number;
}

export default function LocationManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector(state => state.supplier);

  // Mock locations data - replace with actual API calls
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Main Collection Center',
      address: '123 Industrial Road',
      city: 'Colombo',
      state: 'Western Province',
      postalCode: '00100',
      country: 'Sri Lanka',
      coordinates: { lat: 6.9271, lng: 79.8612 },
      contactPerson: 'John Silva',
      contactPhone: '+94 77 123 4567',
      contactEmail: 'john@recyclecorp.lk',
      operatingHours: {
        monday: { open: '08:00', close: '17:00', closed: false },
        tuesday: { open: '08:00', close: '17:00', closed: false },
        wednesday: { open: '08:00', close: '17:00', closed: false },
        thursday: { open: '08:00', close: '17:00', closed: false },
        friday: { open: '08:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '', close: '', closed: true }
      },
      specialInstructions: 'Large vehicle access available. Loading dock at rear.',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-08-15'),
      materialTypes: ['Plastic', 'Metal', 'Paper'],
      storageCapacity: 1000,
      currentUtilization: 650
    },
    {
      id: '2',
      name: 'Kandy Branch',
      address: '456 Hill Street',
      city: 'Kandy',
      state: 'Central Province',
      postalCode: '20000',
      country: 'Sri Lanka',
      coordinates: { lat: 7.2906, lng: 80.6337 },
      contactPerson: 'Sarah Fernando',
      contactPhone: '+94 77 987 6543',
      contactEmail: 'sarah@recyclecorp.lk',
      operatingHours: {
        monday: { open: '09:00', close: '16:00', closed: false },
        tuesday: { open: '09:00', close: '16:00', closed: false },
        wednesday: { open: '09:00', close: '16:00', closed: false },
        thursday: { open: '09:00', close: '16:00', closed: false },
        friday: { open: '09:00', close: '16:00', closed: false },
        saturday: { open: '', close: '', closed: true },
        sunday: { open: '', close: '', closed: true }
      },
      status: 'active',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-08-10'),
      materialTypes: ['Plastic', 'Glass'],
      storageCapacity: 500,
      currentUtilization: 320
    }
  ]);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUtilizationColor = (utilization: number, capacity: number) => {
    const percentage = (utilization / capacity) * 100;
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setShowAddModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setShowAddModal(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(locations.filter(l => l.id !== locationId));
    }
  };

  const handleStatusToggle = (locationId: string) => {
    setLocations(locations.map(location => 
      location.id === locationId 
        ? { ...location, status: location.status === 'active' ? 'inactive' : 'active' as const }
        : location
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your collection centers and storage facilities
          </p>
        </div>
        
        <button
          onClick={handleAddLocation}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Locations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{locations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Locations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {locations.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {locations.reduce((sum, l) => sum + l.storageCapacity, 0).toLocaleString()} kg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {location.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location.address}, {location.city}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(location.status)}`}>
                    {location.status}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditLocation(location)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 space-y-3">
                {/* Contact Info */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>{location.contactPerson}</span>
                  <PhoneIcon className="h-4 w-4 ml-4 mr-2" />
                  <span>{location.contactPhone}</span>
                </div>

                {/* Material Types */}
                <div className="flex flex-wrap gap-2">
                  {location.materialTypes.map((type, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {/* Storage Utilization */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Storage Utilization</span>
                    <span className={`font-medium ${getUtilizationColor(location.currentUtilization, location.storageCapacity)}`}>
                      {location.currentUtilization} / {location.storageCapacity} kg
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((location.currentUtilization / location.storageCapacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((location.currentUtilization / location.storageCapacity) * 100)}% utilized
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(location.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize text-gray-600 dark:text-gray-400">{day.slice(0, 3)}:</span>
                        <span className="text-gray-900 dark:text-white">
                          {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {location.specialInstructions && (
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Special Instructions:</p>
                    <p className="text-gray-900 dark:text-white">{location.specialInstructions}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => handleStatusToggle(location.id)}
                  className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${
                    location.status === 'active'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {location.status === 'active' ? (
                    <>
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Activate
                    </>
                  )}
                </button>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {location.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No locations found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Add your first location to get started.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={handleAddLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Location
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {showAddModal && (
        <LocationModal
          location={editingLocation}
          onClose={() => {
            setShowAddModal(false);
            setEditingLocation(null);
          }}
          onSave={(locationData) => {
            if (editingLocation) {
              setLocations(locations.map(l => 
                l.id === editingLocation.id 
                  ? { ...editingLocation, ...locationData, updatedAt: new Date() }
                  : l
              ));
            } else {
              const newLocation: Location = {
                id: Date.now().toString(),
                name: locationData.name || '',
                address: locationData.address || '',
                city: locationData.city || '',
                state: (locationData as any).state || (locationData as any).province || '',
                postalCode: locationData.postalCode || '',
                country: locationData.country || 'Sri Lanka',
                coordinates: { lat: 0, lng: 0 }, // Would be geocoded
                contactPerson: locationData.contactPerson || '',
                contactPhone: locationData.contactPhone || '',
                contactEmail: locationData.contactEmail || '',
                operatingHours: locationData.operatingHours || {
                  monday: { open: '08:00', close: '17:00', closed: false },
                  tuesday: { open: '08:00', close: '17:00', closed: false },
                  wednesday: { open: '08:00', close: '17:00', closed: false },
                  thursday: { open: '08:00', close: '17:00', closed: false },
                  friday: { open: '08:00', close: '17:00', closed: false },
                  saturday: { open: '09:00', close: '15:00', closed: false },
                  sunday: { open: '', close: '', closed: true }
                },
                specialInstructions: locationData.specialInstructions || '',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                materialTypes: locationData.materialTypes || [],
                storageCapacity: locationData.storageCapacity || 0,
                currentUtilization: 0
              };
              setLocations([...locations, newLocation]);
            }
            setShowAddModal(false);
            setEditingLocation(null);
          }}
        />
      )}
    </div>
  );
}

interface LocationModalProps {
  location: Location | null;
  onClose: () => void;
  onSave: (data: Partial<Location>) => void;
}

function LocationModal({ location, onClose, onSave }: LocationModalProps) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    address: location?.address || '',
    city: location?.city || '',
    state: location?.state || '',
    postalCode: location?.postalCode || '',
    country: location?.country || 'Sri Lanka',
    contactPerson: location?.contactPerson || '',
    contactPhone: location?.contactPhone || '',
    contactEmail: location?.contactEmail || '',
    specialInstructions: location?.specialInstructions || '',
    materialTypes: location?.materialTypes || [],
    storageCapacity: location?.storageCapacity || 0,
    operatingHours: location?.operatingHours || {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    }
  });

  const materialTypeOptions = ['Plastic', 'Metal', 'Paper', 'Glass', 'Textile', 'Electronics', 'Organic'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleMaterialTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        materialTypes: [...formData.materialTypes, type]
      });
    } else {
      setFormData({
        ...formData,
        materialTypes: formData.materialTypes.filter(t => t !== type)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {location ? 'Edit Location' : 'Add New Location'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Storage Capacity (kg) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.storageCapacity}
                onChange={(e) => setFormData({ ...formData, storageCapacity: Number(e.target.value) })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Material Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Material Types Accepted
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {materialTypeOptions.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.materialTypes.includes(type)}
                    onChange={(e) => handleMaterialTypeChange(type, e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Special Instructions
            </label>
            <textarea
              rows={3}
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              placeholder="Loading dock access, parking instructions, etc."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Operating Hours
            </label>
            <div className="space-y-3">
              {Object.entries(formData.operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {day}
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: {
                          ...formData.operatingHours,
                          [day]: { ...hours, closed: !e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Open</span>
                  </label>
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => setFormData({
                          ...formData,
                          operatingHours: {
                            ...formData.operatingHours,
                            [day]: { ...hours, open: e.target.value }
                          }
                        })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => setFormData({
                          ...formData,
                          operatingHours: {
                            ...formData.operatingHours,
                            [day]: { ...hours, close: e.target.value }
                          }
                        })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {location ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
