import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentChartBarIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CustomReport, AnalyticsDashboardData } from '@/types/ai';

interface CustomReportsManagerProps {
  userId: string;
  dashboardData: AnalyticsDashboardData;
}

const CustomReportsManager: React.FC<CustomReportsManagerProps> = ({
  userId,
  dashboardData,
}) => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const mockReports: CustomReport[] = [
    {
      id: '1',
      name: 'Weekly Performance Summary',
      description: 'Weekly overview of key performance metrics',
      type: 'performance',
      parameters: {},
      format: 'pdf',
      sections: [],
      createdAt: new Date(),
      lastGenerated: new Date(),
      isActive: true,
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        recipients: [userId],
      },
    },
    {
      id: '2',
      name: 'Market Trends Analysis',
      description: 'Monthly analysis of market trends and opportunities',
      type: 'market',
      parameters: {},
      format: 'dashboard',
      sections: [],
      createdAt: new Date(),
      isActive: true,
    },
  ];

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'demand': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pricing': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'performance': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'market': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'weekly': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'monthly': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Custom Reports
        </h3>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Report</span>
        </Button>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create Custom Report
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Report Type
                </label>
                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600">
                  <option value="demand">Demand Analysis</option>
                  <option value="pricing">Pricing Report</option>
                  <option value="performance">Performance Summary</option>
                  <option value="market">Market Analysis</option>
                  <option value="custom">Custom Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600">
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="dashboard">Interactive Dashboard</option>
                  <option value="json">JSON Data</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Schedule
                </label>
                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600">
                  <option value="">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                placeholder="Describe what this report should include..."
              />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button>Create Report</Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {report.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getReportTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                  {report.isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Format:</span>
                  <span className="font-medium text-gray-900 dark:text-white uppercase">
                    {report.format}
                  </span>
                </div>

                {report.schedule && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(report.schedule.frequency)}`}>
                      {report.schedule.frequency} at {report.schedule.time}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {report.createdAt.toLocaleDateString()}
                  </span>
                </div>

                {report.lastGenerated && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Generated:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {report.lastGenerated.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <Button size="sm" className="flex-1 flex items-center justify-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  Generate
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {mockReports.length === 0 && (
        <Card className="text-center py-12">
          <DocumentChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Custom Reports
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create custom reports to get AI-powered insights tailored to your needs.
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Your First Report</span>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CustomReportsManager;
