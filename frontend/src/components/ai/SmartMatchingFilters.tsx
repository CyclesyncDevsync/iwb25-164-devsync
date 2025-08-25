import React from 'react';
import { motion } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { SmartMatchingFilters } from '@/types/ai';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SmartMatchingFiltersComponentProps {
  filters: SmartMatchingFilters;
  onChange: (filters: Partial<SmartMatchingFilters>) => void;
  userRole: 'buyer' | 'supplier';
}

const wasteTypeOptions = [
  'Plastic Bottles',
  'Cardboard',
  'Metal Cans',
  'Glass Bottles',
  'Paper',
  'Electronic Waste',
  'Textiles',
  'Organic Waste',
];

const locationOptions = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Matara',
  'Batticaloa',
  'Kurunegala',
];

const timeframeOptions = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '180d', label: '6 Months' },
];

const urgencyOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

const SmartMatchingFiltersComponent: React.FC<SmartMatchingFiltersComponentProps> = ({
  filters,
  onChange,
  userRole,
}) => {
  const handleWasteTypeToggle = (wasteType: string) => {
    const updatedTypes = filters.wasteTypes.includes(wasteType)
      ? filters.wasteTypes.filter(t => t !== wasteType)
      : [...filters.wasteTypes, wasteType];
    onChange({ wasteTypes: updatedTypes });
  };

  const handleLocationToggle = (location: string) => {
    const updatedLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    onChange({ locations: updatedLocations });
  };

  const handleRangeChange = (
    field: 'qualityRange' | 'priceRange' | 'quantityRange',
    index: number,
    value: number
  ) => {
    const currentRange = filters[field] as [number, number];
    const newRange: [number, number] = [...currentRange];
    newRange[index] = value;
    onChange({ [field]: newRange });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waste Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Material Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {wasteTypeOptions.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleWasteTypeToggle(type)}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  filters.wasteTypes.includes(type)
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            Locations
          </label>
          <div className="grid grid-cols-2 gap-2">
            {locationOptions.map((location) => (
              <motion.button
                key={location}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLocationToggle(location)}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  filters.locations.includes(location)
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {location}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quality Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <ScaleIcon className="h-4 w-4 inline mr-1" />
            Quality Range (1-10)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Min:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={filters.qualityRange[0]}
                onChange={(e) => handleRangeChange('qualityRange', 0, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{filters.qualityRange[0]}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Max:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={filters.qualityRange[1]}
                onChange={(e) => handleRangeChange('qualityRange', 1, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{filters.qualityRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
            Price Range ($/ton)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Min:</span>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[0]}
                onChange={(e) => handleRangeChange('priceRange', 0, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-16">${filters.priceRange[0]}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Max:</span>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.priceRange[1]}
                onChange={(e) => handleRangeChange('priceRange', 1, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-16">${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Quantity Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quantity Range (tons)
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Min:</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={filters.quantityRange[0]}
                onChange={(e) => handleRangeChange('quantityRange', 0, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{filters.quantityRange[0]}t</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">Max:</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={filters.quantityRange[1]}
                onChange={(e) => handleRangeChange('quantityRange', 1, Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{filters.quantityRange[1]}t</span>
            </div>
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Timeframe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeframeOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ timeframe: option.value })}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  filters.timeframe === option.value
                    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Urgency */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Urgency Level
        </label>
        <div className="flex space-x-2">
          {urgencyOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange({ urgency: option.value as any })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filters.urgency === option.value
                  ? option.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filters.wasteTypes.length} materials, {filters.locations.length} locations selected
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({
                wasteTypes: [],
                locations: [],
                qualityRange: [1, 10],
                priceRange: [0, 10000],
                quantityRange: [0, 1000],
                timeframe: '30d',
                urgency: 'medium',
              })}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SmartMatchingFiltersComponent;
