'use client';

import { useAuth } from '../../../../hooks/useAuth';
import SupplierLayout from '../../../../components/layout/SupplierLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import StandaloneMaterialRegistration from '../../../../components/demo/StandaloneMaterialRegistration';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Material
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Submit your material with AI-powered quality assessment
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Enhanced Workflow</span>
            </div>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <StandaloneMaterialRegistration 
              onComplete={handleRegistrationComplete}
              supplierId={user?.asgardeoId}
            />
          </motion.div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2" />
              What happens after submission?
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Your photos will be analyzed by AI for quality assessment
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                An agent will be automatically assigned based on your location
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You will receive updates throughout the verification process
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Once approved, your material will be listed in the marketplace
              </li>
            </ul>
          </div>
        </div>
      </SupplierLayout>
    </ProtectedRoute>
  );
}