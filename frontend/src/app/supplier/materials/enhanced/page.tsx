'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CogIcon, 
  UserGroupIcon,
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';
import EnhancedMaterialRegistration from '../../../../components/supplier/EnhancedMaterialRegistration';
import { MaterialRegistrationForm, AIAnalysisResult, AgentAssignment } from '../../../../types/supplier';

export default function EnhancedMaterialRegistrationPage() {
  const [isDemo, setIsDemo] = useState(true);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<{
    material: MaterialRegistrationForm;
    analysis: AIAnalysisResult;
    agent: AgentAssignment;
  } | null>(null);

  const handleRegistrationComplete = (
    material: MaterialRegistrationForm,
    analysisResult: AIAnalysisResult,
    agentAssignment: AgentAssignment
  ) => {
    setCompletedSubmission({
      material,
      analysis: analysisResult,
      agent: agentAssignment
    });
    setSubmissionComplete(true);
  };

  const resetDemo = () => {
    setSubmissionComplete(false);
    setCompletedSubmission(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enhanced Material Registration
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Submit your materials with AI analysis and automated agent assignment
            </p>
            
            {/* Demo Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-sm text-gray-600 dark:text-gray-400">Demo Mode</span>
              <button
                onClick={() => setIsDemo(!isDemo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDemo ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isDemo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isDemo ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Process Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  1. Submit Material
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fill out the form with material details and upload photos
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2. AI Analysis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI analyzes your photos for quality assessment
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  3. Agent Assignment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Field agent assigned for on-site verification
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CogIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4. Auction Listed
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Approved materials listed in marketplace
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        {!submissionComplete ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <EnhancedMaterialRegistration onComplete={handleRegistrationComplete} />
            </div>
          </motion.div>
        ) : (
          // Submission Complete View
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentCheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Submission Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your material has been submitted and processed through our enhanced workflow.
                </p>
              </div>

              {completedSubmission && (
                <div className="space-y-6">
                  {/* Material Summary */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Material Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-gray-600 dark:text-gray-400">Title</label>
                        <p className="text-gray-900 dark:text-white">{completedSubmission.material.title}</p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 dark:text-gray-400">Category</label>
                        <p className="text-gray-900 dark:text-white">
                          {completedSubmission.material.category} - {completedSubmission.material.subCategory}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 dark:text-gray-400">Quantity</label>
                        <p className="text-gray-900 dark:text-white">
                          {completedSubmission.material.quantity} {completedSubmission.material.unit}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-gray-600 dark:text-gray-400">Expected Price</label>
                        <p className="text-gray-900 dark:text-white">
                          LKR {completedSubmission.material.expectedPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Results */}
                  <div className={`border rounded-lg p-6 ${
                    completedSubmission.analysis.approved 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                  }`}>
                    <h3 className={`text-xl font-semibold mb-4 ${
                      completedSubmission.analysis.approved 
                        ? 'text-green-800 dark:text-green-100'
                        : 'text-red-800 dark:text-red-100'
                    }`}>
                      AI Analysis Results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className={`font-medium ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>Quality Score</label>
                        <p className={`text-2xl font-bold ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {completedSubmission.analysis.overallScore}/100
                        </p>
                      </div>
                      <div>
                        <label className={`font-medium ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>Grade</label>
                        <p className={`text-lg font-semibold capitalize ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {completedSubmission.analysis.qualityGrade}
                        </p>
                      </div>
                      <div>
                        <label className={`font-medium ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>Status</label>
                        <p className={`text-lg font-semibold ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                        }`}>
                          {completedSubmission.analysis.approved ? 'Approved' : 'Needs Review'}
                        </p>
                      </div>
                    </div>

                    {completedSubmission.analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className={`font-medium mb-2 ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-800 dark:text-green-100'
                            : 'text-red-800 dark:text-red-100'
                        }`}>
                          Recommendations
                        </h4>
                        <ul className={`text-sm space-y-1 ${
                          completedSubmission.analysis.approved 
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {completedSubmission.analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Agent Assignment */}
                  <div className="border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-100 mb-4">
                      Agent Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-blue-700 dark:text-blue-300">Agent Name</label>
                        <p className="text-blue-900 dark:text-blue-100 text-lg font-semibold">
                          {completedSubmission.agent.agentName}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-700 dark:text-blue-300">Contact</label>
                        <p className="text-blue-900 dark:text-blue-100">
                          {completedSubmission.agent.agentPhone}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-700 dark:text-blue-300">Expected Visit</label>
                        <p className="text-blue-900 dark:text-blue-100">
                          {completedSubmission.agent.estimatedArrival.toLocaleDateString()} at{' '}
                          {completedSubmission.agent.estimatedArrival.toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-700 dark:text-blue-300">Visit Cost</label>
                        <p className="text-blue-900 dark:text-blue-100">
                          LKR {completedSubmission.agent.visitCost.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Will be deducted from final payment
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      What Happens Next?
                    </h3>
                    <div className="space-y-3 text-gray-600 dark:text-gray-400">
                      <div className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                          1
                        </span>
                        <p>The assigned agent will visit your location at the scheduled time</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                          2
                        </span>
                        <p>They will conduct an on-site quality verification and assessment</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                          3
                        </span>
                        <p>If approved, your material will be listed in our auction marketplace</p>
                      </div>
                      <div className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                          4
                        </span>
                        <p>You'll receive notifications throughout the entire process</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetDemo}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Try Another Submission
                    </button>
                    <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      Track Workflow Status
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Demo Note */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Demo Mode: This is a demonstration of the enhanced workflow
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}