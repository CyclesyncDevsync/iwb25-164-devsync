'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface QualityAssessmentProps {
  materialType: string;
  photos: string[];
  onSubmit: (score: number, notes?: string) => void;
  existingScore?: number | null;
}

interface QualityCriteria {
  id: string;
  label: string;
  description: string;
  weight: number;
  score: number;
}

const QualityAssessment: React.FC<QualityAssessmentProps> = ({
  materialType,
  photos,
  onSubmit,
  existingScore
}) => {
  const [overallScore, setOverallScore] = useState(existingScore || 0);
  const [criteria, setCriteria] = useState<QualityCriteria[]>([
    {
      id: 'purity',
      label: 'Material Purity',
      description: 'Free from contamination, clean, unmixed',
      weight: 0.3,
      score: 0
    },
    {
      id: 'condition',
      label: 'Physical Condition',
      description: 'Not damaged, broken, or deteriorated',
      weight: 0.25,
      score: 0
    },
    {
      id: 'sorting',
      label: 'Proper Sorting',
      description: 'Correctly categorized and separated',
      weight: 0.2,
      score: 0
    },
    {
      id: 'quantity',
      label: 'Quantity Accuracy',
      description: 'Matches declared amount',
      weight: 0.15,
      score: 0
    },
    {
      id: 'presentation',
      label: 'Presentation',
      description: 'Well organized and accessible',
      weight: 0.1,
      score: 0
    }
  ]);
  
  const [notes, setNotes] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const commonIssues = [
    'Contamination with other materials',
    'Physical damage or deterioration',
    'Improper sorting/mixing',
    'Quantity discrepancy',
    'Poor storage conditions',
    'Missing documentation',
    'Safety hazards present',
    'Quality below standards'
  ];

  const updateCriteriaScore = useCallback((criteriaId: string, score: number) => {
    setCriteria(prev => {
      const updated = prev.map(c => 
        c.id === criteriaId ? { ...c, score } : c
      );
      
      // Calculate weighted overall score
      const weightedScore = updated.reduce((sum, c) => sum + (c.score * c.weight), 0);
      setOverallScore(Math.round(weightedScore * 10) / 10);
      
      return updated;
    });
  }, []);

  const toggleIssue = useCallback((issue: string) => {
    setIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 6) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    if (score >= 4) return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  const handleSubmit = () => {
    onSubmit(overallScore, notes || undefined);
  };

  const canSubmit = criteria.every(c => c.score > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Quality Assessment
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Evaluate the quality of {materialType} based on industry standards
        </p>
      </div>

      {/* Photo Reference */}
      {photos.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Reference Photos
            </h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <PhotoIcon className="w-4 h-4 mr-1" />
              {selectedPhotoIndex + 1} of {photos.length}
            </div>
          </div>
          
          <div className="relative mb-3">
            <img
              src={photos[selectedPhotoIndex]}
              alt={`Reference ${selectedPhotoIndex + 1}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
          
          {photos.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded border-2 ${
                    selectedPhotoIndex === index
                      ? 'border-agent-DEFAULT'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quality Criteria */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Assessment Criteria
        </h3>
        
        <div className="space-y-4">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {criterion.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {criterion.description}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Weight: {Math.round(criterion.weight * 100)}%
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => updateCriteriaScore(criterion.id, score)}
                    className={`w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors ${
                      criterion.score >= score
                        ? score <= 4 
                          ? 'bg-red-500 border-red-500 text-white'
                          : score <= 6
                          ? 'bg-yellow-500 border-yellow-500 text-white'
                          : score <= 8
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              
              {criterion.score > 0 && (
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${getScoreColor(criterion.score)}`}>
                    Score: {criterion.score}/10
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    (Weighted: {(criterion.score * criterion.weight).toFixed(1)})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`border rounded-lg p-4 ${getScoreBg(overallScore)}`}
      >
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)} mb-2`}>
            {overallScore.toFixed(1)}/10
          </div>
          <div className="flex items-center justify-center mb-2">
            {overallScore >= 8 ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
            ) : overallScore >= 6 ? (
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-2" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-600 mr-2" />
            )}
            <span className={`font-medium ${getScoreColor(overallScore)}`}>
              {overallScore >= 8 ? 'Excellent Quality' :
               overallScore >= 6 ? 'Good Quality' :
               overallScore >= 4 ? 'Fair Quality' : 'Poor Quality'}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Material will be {overallScore >= 6 ? 'APPROVED' : 'REJECTED'} for processing
          </p>
        </div>
      </motion.div>

      {/* Issues Checklist */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Identified Issues (Optional)
        </h3>
        
        <div className="grid grid-cols-1 gap-2">
          {commonIssues.map((issue) => (
            <label key={issue} className="flex items-center">
              <input
                type="checkbox"
                checked={issues.includes(issue)}
                onChange={() => toggleIssue(issue)}
                className="rounded border-gray-300 text-agent-DEFAULT focus:ring-agent-DEFAULT"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {issue}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-agent-DEFAULT focus:border-agent-DEFAULT"
          placeholder="Add any specific observations, recommendations, or concerns..."
        />
      </div>

      {/* Submit Button */}
      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-agent-DEFAULT text-white py-3 px-4 rounded-lg font-medium hover:bg-agent-DEFAULT/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canSubmit ? 'Continue to Specifications' : 'Complete all criteria to continue'}
        </button>
        
        {!canSubmit && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Please rate all criteria before proceeding
          </p>
        )}
      </div>
    </div>
  );
};

export default QualityAssessment;
