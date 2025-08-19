'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ScaleIcon,
  BeakerIcon,
  DocumentTextIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface MaterialData {
  id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  supplier: {
    id: string;
    name: string;
    contact: string;
  };
}

interface MaterialSpecFormProps {
  materialData: MaterialData;
  onSubmit: (specifications: any) => void;
  existingSpecs?: any;
}

interface Specification {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  type: 'text' | 'number' | 'select' | 'dimension';
  required: boolean;
  options?: string[];
}

const MaterialSpecForm: React.FC<MaterialSpecFormProps> = ({
  materialData,
  onSubmit,
  existingSpecs
}) => {
  const [specifications, setSpecifications] = useState<Record<string, any>>(
    existingSpecs || {}
  );
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [actualQuantity, setActualQuantity] = useState<number>(materialData.quantity);
  const [customSpecs, setCustomSpecs] = useState<Array<{key: string; value: string}>>([]);

  // Default specifications based on material type
  const getDefaultSpecs = useCallback((): Specification[] => {
    const baseSpecs: Specification[] = [
      {
        id: 'actualWeight',
        label: 'Actual Weight',
        value: actualWeight,
        unit: 'kg',
        type: 'number',
        required: true
      },
      {
        id: 'actualQuantity',
        label: 'Actual Quantity',
        value: actualQuantity,
        unit: materialData.unit,
        type: 'number',
        required: true
      },
      {
        id: 'storageCondition',
        label: 'Storage Condition',
        value: '',
        type: 'select',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      {
        id: 'moisture',
        label: 'Moisture Level',
        value: '',
        type: 'select',
        required: false,
        options: ['Dry', 'Slightly Moist', 'Moist', 'Wet']
      }
    ];

    // Material-specific specifications
    switch (materialData.type.toLowerCase()) {
      case 'plastic bottles':
      case 'pet bottles':
        return [
          ...baseSpecs,
          {
            id: 'bottleSize',
            label: 'Bottle Size',
            value: '',
            unit: 'ml',
            type: 'select',
            required: true,
            options: ['250ml', '500ml', '750ml', '1L', '1.5L', '2L', 'Mixed']
          },
          {
            id: 'capStatus',
            label: 'Cap Status',
            value: '',
            type: 'select',
            required: true,
            options: ['With Caps', 'Without Caps', 'Mixed']
          },
          {
            id: 'labelStatus',
            label: 'Label Status',
            value: '',
            type: 'select',
            required: true,
            options: ['With Labels', 'Without Labels', 'Partially Removed', 'Mixed']
          },
          {
            id: 'compression',
            label: 'Compression Level',
            value: '',
            type: 'select',
            required: false,
            options: ['Compressed', 'Not Compressed', 'Partially Compressed']
          }
        ];

      case 'metal':
      case 'aluminum':
      case 'steel':
        return [
          ...baseSpecs,
          {
            id: 'metalType',
            label: 'Metal Type',
            value: '',
            type: 'select',
            required: true,
            options: ['Aluminum', 'Steel', 'Iron', 'Copper', 'Mixed Metals']
          },
          {
            id: 'thickness',
            label: 'Average Thickness',
            value: '',
            unit: 'mm',
            type: 'number',
            required: false
          },
          {
            id: 'magnetism',
            label: 'Magnetic Properties',
            value: '',
            type: 'select',
            required: true,
            options: ['Magnetic', 'Non-Magnetic', 'Mixed']
          },
          {
            id: 'oxidation',
            label: 'Oxidation Level',
            value: '',
            type: 'select',
            required: true,
            options: ['None', 'Light', 'Moderate', 'Heavy']
          }
        ];

      case 'paper':
      case 'cardboard':
        return [
          ...baseSpecs,
          {
            id: 'paperType',
            label: 'Paper Type',
            value: '',
            type: 'select',
            required: true,
            options: ['Newspaper', 'Magazine', 'Office Paper', 'Cardboard', 'Mixed']
          },
          {
            id: 'contamination',
            label: 'Contamination Level',
            value: '',
            type: 'select',
            required: true,
            options: ['Clean', 'Light Contamination', 'Moderate Contamination', 'Heavy Contamination']
          },
          {
            id: 'binding',
            label: 'Binding/Staples',
            value: '',
            type: 'select',
            required: false,
            options: ['None', 'Staples Present', 'Plastic Binding', 'Mixed']
          }
        ];

      default:
        return baseSpecs;
    }
  }, [materialData, actualWeight, actualQuantity]);

  const defaultSpecs = getDefaultSpecs();

  const updateSpecification = useCallback((id: string, value: any) => {
    setSpecifications(prev => ({
      ...prev,
      [id]: value
    }));

    // Update state for reactive specs
    if (id === 'actualWeight') setActualWeight(value);
    if (id === 'actualQuantity') setActualQuantity(value);
  }, []);

  const addCustomSpec = useCallback(() => {
    setCustomSpecs(prev => [...prev, { key: '', value: '' }]);
  }, []);

  const removeCustomSpec = useCallback((index: number) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateCustomSpec = useCallback((index: number, field: 'key' | 'value', value: string) => {
    setCustomSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  }, []);

  const calculateVariance = (declared: number, actual: number) => {
    const variance = ((actual - declared) / declared) * 100;
    return {
      value: variance,
      status: Math.abs(variance) <= 5 ? 'good' : Math.abs(variance) <= 15 ? 'warning' : 'error'
    };
  };

  const quantityVariance = calculateVariance(materialData.quantity, actualQuantity);
  const weightVariance = actualWeight > 0 ? calculateVariance(materialData.quantity, actualWeight) : null;

  const handleSubmit = () => {
    const finalSpecs = {
      ...specifications,
      customSpecifications: customSpecs.filter(spec => spec.key && spec.value),
      variances: {
        quantity: quantityVariance,
        weight: weightVariance
      },
      timestamp: Date.now()
    };

    onSubmit(finalSpecs);
  };

  const isFormValid = () => {
    const requiredSpecs = defaultSpecs.filter(spec => spec.required);
    return requiredSpecs.every(spec => 
      specifications[spec.id] !== undefined && 
      specifications[spec.id] !== '' && 
      specifications[spec.id] !== 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Material Specifications
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Record detailed specifications for {materialData.type}
        </p>
      </div>

      {/* Declared vs Actual */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Quantity Verification
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {materialData.quantity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Declared {materialData.unit}
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {actualQuantity}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Actual {materialData.unit}
            </div>
          </div>
        </div>

        {/* Variance Indicator */}
        <div className={`p-3 rounded-lg border ${
          quantityVariance.status === 'good' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : quantityVariance.status === 'warning'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
        }`}>
          <div className="text-sm font-medium">
            Variance: {quantityVariance.value > 0 ? '+' : ''}{quantityVariance.value.toFixed(1)}%
          </div>
          <div className="text-xs">
            {quantityVariance.status === 'good' && '✓ Within acceptable range (±5%)'}
            {quantityVariance.status === 'warning' && '⚠️ Moderate variance (5-15%)'}
            {quantityVariance.status === 'error' && '❌ High variance (>15%)'}
          </div>
        </div>
      </div>

      {/* Specifications Form */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Material Details
        </h3>
        
        <div className="space-y-4">
          {defaultSpecs.map((spec) => (
            <div key={spec.id}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {spec.label}
                {spec.required && <span className="text-red-500 ml-1">*</span>}
                {spec.unit && <span className="text-gray-500 ml-1">({spec.unit})</span>}
              </label>
              
              {spec.type === 'select' ? (
                <select
                  value={specifications[spec.id] || ''}
                  onChange={(e) => updateSpecification(spec.id, e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                  required={spec.required}
                >
                  <option value="">Select {spec.label}</option>
                  {spec.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={spec.type}
                  value={specifications[spec.id] || ''}
                  onChange={(e) => updateSpecification(spec.id, 
                    spec.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  )}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                  required={spec.required}
                  min={spec.type === 'number' ? 0 : undefined}
                  step={spec.type === 'number' ? 0.1 : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Specifications */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Additional Specifications
          </h3>
          <button
            onClick={addCustomSpec}
            className="flex items-center text-agent-DEFAULT hover:text-agent-DEFAULT/80"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
        
        {customSpecs.length > 0 && (
          <div className="space-y-3">
            {customSpecs.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3"
              >
                <input
                  type="text"
                  placeholder="Specification name"
                  value={spec.key}
                  onChange={(e) => updateCustomSpec(index, 'key', e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
                />
                <button
                  onClick={() => removeCustomSpec(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className="w-full bg-agent-DEFAULT text-white py-3 px-4 rounded-lg font-medium hover:bg-agent-DEFAULT/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFormValid() ? 'Continue to Review' : 'Complete required fields to continue'}
        </button>
        
        {!isFormValid() && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Please fill in all required specifications
          </p>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 Tip: Accurate specifications help ensure proper pricing and processing. 
          Take measurements carefully and note any quality concerns.
        </p>
      </div>
    </div>
  );
};

export default MaterialSpecForm;
