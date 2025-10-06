'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

interface LocationPickerProps {
  onSendLocation: (location: LocationData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onSendLocation,
  onCancel,
  isOpen,
}) => {
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Try to get address from coordinates (reverse geocoding)
      try {
        const address = await reverseGeocode(location.latitude, location.longitude);
        location.address = address;
        location.name = 'Current Location';
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        location.address = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
        location.name = 'Current Location';
      }

      setCurrentLocation(location);
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Unable to get current location. Please enable location services.');
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // This is a mock implementation - in production, you'd use a real geocoding service
    // like Google Maps Geocoding API, OpenStreetMap Nominatim, etc.
    const response = await fetch(
      `https://api.example.com/geocode/reverse?lat=${lat}&lng=${lng}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    return data.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock search implementation - replace with real geocoding service
      const response = await fetch(
        `https://api.example.com/geocode/search?q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Location search error:', error);
      setError('Unable to search locations. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocations(searchQuery);
  };

  const handleSendLocation = () => {
    if (selectedLocation) {
      onSendLocation(selectedLocation);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setCurrentLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
    setError(null);
    onCancel();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mb-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('chat.shareLocation') || 'Share Location'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('chat.searchLocation') || 'Search for a location...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              {isLoading && (
                <ArrowPathIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Current Location */}
          <div className="mb-4">
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingCurrentLocation}
              className="w-full flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
            >
              {isLoadingCurrentLocation ? (
                <ArrowPathIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              ) : (
                <MapPinIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {isLoadingCurrentLocation 
                    ? (t('chat.gettingLocation') || 'Getting location...')
                    : (t('chat.useCurrentLocation') || 'Use current location')
                  }
                </p>
                {currentLocation && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {currentLocation.address || formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                  </p>
                )}
              </div>
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-4 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t('chat.searchResults') || 'Search Results'}
              </h4>
              <div className="space-y-1">
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedLocation(location)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-colors ${
                            selectedLocation === location
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}>
                  
                    <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {location.name || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {location.address || formatCoordinates(location.latitude, location.longitude)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Location Preview */}
          {selectedLocation && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    {selectedLocation.name || 'Selected Location'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {selectedLocation.address || formatCoordinates(selectedLocation.latitude, selectedLocation.longitude)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <motion.button
              whileHover={{ scale: selectedLocation ? 1.05 : 1 }}
              whileTap={{ scale: selectedLocation ? 0.95 : 1 }}
              onClick={handleSendLocation}
              disabled={!selectedLocation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{t('chat.sendLocation') || 'Send Location'}</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
