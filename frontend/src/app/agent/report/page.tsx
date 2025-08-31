'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentLayout from '@/components/layout/AgentLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function AgentReportPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // TODO: Implement report submission to backend
    console.log('Submitting report:', { reportType, description, priority });
    
    // Simulate submission
    setTimeout(() => {
      alert('Report submitted successfully!');
      router.push('/agent');
    }, 1000);
  };

  return (
    <AgentLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-500 p-3 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Report Issue
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Report problems or discrepancies
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:border-gray-600 dark:text-white"
              >
                <option value="">Select report type</option>
                <option value="material_discrepancy">Material Discrepancy</option>
                <option value="location_issue">Location Issue</option>
                <option value="quality_concern">Quality Concern</option>
                <option value="safety_issue">Safety Issue</option>
                <option value="technical_problem">Technical Problem</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Please describe the issue in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:border-gray-600 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/agent')}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AgentLayout>
  );
}