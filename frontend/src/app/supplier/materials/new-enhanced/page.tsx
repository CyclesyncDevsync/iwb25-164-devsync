'use client';

import { useAuth } from '../../../../hooks/useAuth';
import SupplierLayout from '../../../../components/layout/SupplierLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import StandaloneMaterialRegistration from '../../../../components/demo/StandaloneMaterialRegistration';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function SupplierEnhancedMaterialsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Debug logging
  console.log('🔐 Current user:', user);
  console.log('🆔 User asgardeoId:', user?.asgardeoId);

  const handleRegistrationComplete = () => {
    // Redirect to materials page immediately
    router.push('/supplier/materials');
  };

  return (
    <ProtectedRoute allowedRoles={['SUPPLIER']}>
      <SupplierLayout>
  <div className="space-y-0">
          {/* Neutral Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                  className="mb-2"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Material</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">AI-Powered Quality Assessment</p>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.35 }}
                  className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl"
                >
                  Transform your waste into value with our intelligent material registration system. Upload photos, specify details, and let our AI analyze quality for optimal pricing.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                className="hidden md:block"
              >
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                    <SparklesIcon className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-200">Enhanced Workflow</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
          >
            <StandaloneMaterialRegistration
              onComplete={handleRegistrationComplete}
              supplierId={user?.asgardeoId}
            />
          </motion.div>

          {/* Enhanced Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 shadow-xl"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mr-3">
                  <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                What happens after submission?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></span>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Your photos will be analyzed by AI for quality assessment</span>
                  </div>
                  <div className="flex items-start p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></span>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">An agent will be automatically assigned based on your location</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></span>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">You will receive updates throughout the verification process</span>
                  </div>
                  <div className="flex items-start p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
                    <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></span>
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Once approved, your material will be listed in the marketplace</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SupplierLayout>
    </ProtectedRoute>
  );
}