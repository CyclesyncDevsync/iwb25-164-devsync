import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  StopCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { RootState, AppDispatch } from '@/store';
import { fetchAuctions, setFilters } from '@/store/slices/auctionSlice';
import { Auction, AuctionStatus, AuctionType } from '@/types/auction';
import { AuctionApiService } from '@/services/auctionApi';
import { formatCurrency, formatDate, formatTimeRemaining } from '@/utils/formatters';
import AuctionWizard from './AuctionWizard';

interface AuctionManagementProps {
  userRole?: 'admin' | 'supplier';
}

const AuctionManagement: React.FC<AuctionManagementProps> = ({
  userRole = 'supplier'
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { auctions, loading, error, totalItems } = useSelector((state: RootState) => state.auctions);
  
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [selectedAuctions, setSelectedAuctions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AuctionType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Load auctions and analytics
  useEffect(() => {
    const filters: any = {};
    if (statusFilter !== 'all') filters.status = [statusFilter];
    if (typeFilter !== 'all') filters.type = [typeFilter];
    if (searchQuery) filters.searchQuery = searchQuery;

    dispatch(fetchAuctions({ page: 1, limit: 50, filters }));
    
    // Load analytics (mock data for now)
    setAnalytics({
      totalAuctions: 156,
      activeAuctions: 23,
      totalRevenue: 125000,
      averageBidValue: 350,
      conversionRate: 78.5,
      topCategory: 'Electronics'
    });
  }, [dispatch, statusFilter, typeFilter, searchQuery]);

  // Handle auction actions
  const handleStartAuction = async (auctionId: string) => {
    try {
      // await AuctionApiService.updateAuction(auctionId, { status: 'active' });
      // Refresh auctions
    } catch (error) {
      console.error('Failed to start auction:', error);
    }
  };

  const handlePauseAuction = async (auctionId: string) => {
    try {
      // await AuctionApiService.updateAuction(auctionId, { status: 'paused' });
      // Refresh auctions
    } catch (error) {
      console.error('Failed to pause auction:', error);
    }
  };

  const handleEndAuction = async (auctionId: string) => {
    try {
      // await AuctionApiService.updateAuction(auctionId, { status: 'ended' });
      // Refresh auctions
    } catch (error) {
      console.error('Failed to end auction:', error);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    
    try {
      await AuctionApiService.deleteAuction(auctionId);
      // Refresh auctions
    } catch (error) {
      console.error('Failed to delete auction:', error);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'start' | 'pause' | 'end') => {
    if (selectedAuctions.length === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedAuctions.length} auction(s)?`)) return;
      try {
        await AuctionApiService.bulkDeleteAuctions(selectedAuctions);
        setSelectedAuctions([]);
        // Refresh auctions
      } catch (error) {
        console.error('Failed to delete auctions:', error);
      }
    } else {
      try {
        await AuctionApiService.bulkUpdateAuctions(selectedAuctions, { status: action as AuctionStatus });
        setSelectedAuctions([]);
        // Refresh auctions
      } catch (error) {
        console.error('Failed to update auctions:', error);
      }
    }
  };

  const handleExportData = async (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    try {
      // Export all auctions data
      const blob = await AuctionApiService.exportAuctionData('all', format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auctions.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getStatusIcon = (status: AuctionStatus) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'ended': return <StopCircle className="w-4 h-4 text-gray-600" />;
      case 'upcoming': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: AuctionStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const calculateTimeRemaining = (endTime: Date) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const remaining = Math.max(0, end - now);
    return remaining;
  };

  if (showCreateWizard) {
    return (
      <AuctionWizard
        onComplete={(auction) => {
          setShowCreateWizard(false);
          // Refresh auctions
        }}
        onCancel={() => setShowCreateWizard(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <p className="text-gray-600">Manage your auctions and track performance</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExportData('csv')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowCreateWizard(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Auction</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AuctionStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AuctionType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard</option>
              <option value="dutch">Dutch</option>
              <option value="reserve">Reserve</option>
              <option value="buy_it_now">Buy It Now</option>
              <option value="bulk">Bulk</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedAuctions.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAuctions.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('start')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                Start
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
              >
                Pause
              </button>
              <button
                onClick={() => handleBulkAction('end')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                End
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auctions Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAuctions.length === auctions.length && auctions.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAuctions(auctions.map(a => a.id));
                      } else {
                        setSelectedAuctions([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bids
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auctions.map((auction) => {
                const timeRemaining = calculateTimeRemaining(auction.endTime);
                const isSelected = selectedAuctions.includes(auction.id);
                
                return (
                  <motion.tr
                    key={auction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAuctions([...selectedAuctions, auction.id]);
                          } else {
                            setSelectedAuctions(selectedAuctions.filter(id => id !== auction.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={auction.images[0] || '/placeholder-auction.jpg'}
                            alt={auction.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {auction.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {auction.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {auction.type.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                        {getStatusIcon(auction.status)}
                        <span className="capitalize">{auction.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(auction.currentPrice)}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{auction.totalBids}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {auction.status === 'active' && timeRemaining > 0 ? (
                        <span className={timeRemaining <= 300000 ? 'text-red-600 font-medium' : ''}>
                          {formatTimeRemaining(timeRemaining)}
                        </span>
                      ) : auction.status === 'upcoming' ? (
                        <span className="text-blue-600">
                          Starts {formatDate(auction.startTime, 'relative')}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === auction.id ? null : auction.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {dropdownOpen === auction.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  // Navigate to auction details
                                  window.open(`/auction/${auction.id}`, '_blank');
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  // Navigate to edit
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                              
                              {auction.status === 'upcoming' && (
                                <button
                                  onClick={() => {
                                    handleStartAuction(auction.id);
                                    setDropdownOpen(null);
                                  }}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                >
                                  <Play className="w-4 h-4" />
                                  <span>Start</span>
                                </button>
                              )}
                              
                              {auction.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => {
                                      handlePauseAuction(auction.id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100"
                                  >
                                    <Pause className="w-4 h-4" />
                                    <span>Pause</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      handleEndAuction(auction.id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <StopCircle className="w-4 h-4" />
                                    <span>End</span>
                                  </button>
                                </>
                              )}
                              
                              <button
                                onClick={() => {
                                  // Navigate to analytics
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                              >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                              </button>
                              
                              <div className="border-t border-gray-100"></div>
                              
                              <button
                                onClick={() => {
                                  handleDeleteAuction(auction.id);
                                  setDropdownOpen(null);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {auctions.length === 0 && !loading.auctions && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No auctions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first auction.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateWizard(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Auction
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading.auctions && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading auctions...</p>
          </div>
        )}
      </div>

      {/* Pagination would go here */}
      {totalItems > 50 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(50, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </div>
          {/* Add pagination component here */}
        </div>
      )}
    </div>
  );
};

export default AuctionManagement;
