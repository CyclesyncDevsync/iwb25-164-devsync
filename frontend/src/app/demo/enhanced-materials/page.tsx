'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CogIcon, 
  UserGroupIcon,
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';
import StandaloneMaterialRegistration from '../../../components/demo/StandaloneMaterialRegistration';

// Define types locally to avoid imports that might trigger auth checks
interface MaterialRegistrationForm {
  title: string;
  category: string;
  subCategory: string;
  quantity: number;
  unit: string;
  expectedPrice?: number;
}



export default function DemoEnhancedMaterialRegistrationPage() {
  const [isDemo] = useState(true);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [completedSubmission, setCompletedSubmission] = useState<{
    material: MaterialRegistrationForm;
    submissionResult: any;
  } | null>(null);

  const handleRegistrationComplete = (
    material: MaterialRegistrationForm,
    submissionResult: any
  ) => {
    setCompletedSubmission({
      material,
      submissionResult
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
        {/* Demo Banner */}
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            🚀 Demo Mode - No Authentication Required
          </p>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enhanced Material Registration Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Test the AI-powered material submission workflow
            </p>
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
              <StandaloneMaterialRegistration onComplete={handleRegistrationComplete} />
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

                  {/* Submission Details */}
                  <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-100 mb-4">
                      Submission Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-medium text-green-700 dark:text-green-300">Transaction ID</label>
                        <p className="text-lg font-mono text-green-900 dark:text-green-100">
                          {completedSubmission.submissionResult.transactionId}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-green-700 dark:text-green-300">Workflow ID</label>
                        <p className="text-lg font-mono text-green-900 dark:text-green-100">
                          {completedSubmission.submissionResult.workflowId}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-green-700 dark:text-green-300">Supplier ID</label>
                        <p className="text-lg font-mono text-green-900 dark:text-green-100">
                          {completedSubmission.submissionResult.supplierId}
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
                      {completedSubmission.material.deliveryMethod === 'agent_visit' ? (
                        <>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              1
                            </span>
                            <p>Our agent nearest to your location will contact you shortly to schedule a convenient appointment</p>
                          </div>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              2
                            </span>
                            <p>The agent will visit your location at the agreed time for quality verification</p>
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
                        </>
                      ) : (
                        <>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              1
                            </span>
                            <p>Our agent will contact you to inform you when to bring your material to the collection center</p>
                          </div>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              2
                            </span>
                            <p>Bring your material to the selected collection center at the scheduled time</p>
                          </div>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              3
                            </span>
                            <p>Our agent will verify the material quality. If not selected, you'll need to take it back</p>
                          </div>
                          <div className="flex items-start">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mr-3 mt-0.5">
                              4
                            </span>
                            <p>If approved, your material will be listed in our auction marketplace</p>
                          </div>
                        </>
                      )}
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
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}