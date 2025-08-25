import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface ReportType {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'csv' | 'excel';
  category: 'financial' | 'operational' | 'analytical';
}

export function ReportsManagement() {
  const [reports] = useState<ReportType[]>([
    {
      id: 'rep1',
      name: 'Monthly Transaction Summary',
      description: 'Overview of all transactions processed in the current month',
      format: 'pdf',
      category: 'financial'
    },
    {
      id: 'rep2',
      name: 'User Activity Report',
      description: 'Analysis of user engagement and activities on the platform',
      format: 'csv',
      category: 'analytical'
    },
    {
      id: 'rep3',
      name: 'Materials Inventory',
      description: 'Current inventory of all materials listed on the platform',
      format: 'excel',
      category: 'operational'
    },
    {
      id: 'rep4',
      name: 'Auction Performance',
      description: 'Metrics on auction completion rates and bid engagement',
      format: 'pdf',
      category: 'analytical'
    },
    {
      id: 'rep5',
      name: 'Revenue Report',
      description: 'Detailed breakdown of platform revenue streams',
      format: 'excel',
      category: 'financial'
    },
    {
      id: 'rep6',
      name: 'Dispute Resolution Metrics',
      description: 'Analysis of dispute resolution efficiency and outcomes',
      format: 'pdf',
      category: 'operational'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  const handleGenerateReport = (reportId: string) => {
    // In a real application, this would trigger a report generation process
    console.log(`Generating report: ${reportId}`);
    // Mock success message
    alert(`Report ${reportId} has been generated and is ready for download.`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'operational':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        );
      case 'analytical':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"></path>
            <path d="M18 9l-5 5-4-4-3 3"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        );
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'csv':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'excel':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              All Reports
            </Button>
            <Button
              variant={selectedCategory === 'financial' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('financial')}
            >
              Financial
            </Button>
            <Button
              variant={selectedCategory === 'operational' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('operational')}
            >
              Operational
            </Button>
            <Button
              variant={selectedCategory === 'analytical' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('analytical')}
            >
              Analytical
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map(report => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <span className="flex items-center">{getCategoryIcon(report.category)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-6">{report.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center">
                  {getFormatIcon(report.format)}
                  <span className="text-xs ml-1 uppercase font-medium">{report.format}</span>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Generate a custom report by selecting specific parameters and date ranges.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="w-full h-10 rounded-md border border-input px-3">
                  <option value="">Select a report type</option>
                  <option value="transactions">Transactions</option>
                  <option value="users">Users</option>
                  <option value="materials">Materials</option>
                  <option value="auctions">Auctions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select className="w-full h-10 rounded-md border border-input px-3">
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input 
                  type="date" 
                  className="w-full h-10 rounded-md border border-input px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input 
                  type="date" 
                  className="w-full h-10 rounded-md border border-input px-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>
                Generate Custom Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
