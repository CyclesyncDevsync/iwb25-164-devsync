import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/Dialog';
import { Input } from '../ui/Input';

interface Auction {
  id: string;
  title: string;
  materialId: string;
  materialName: string;
  startPrice: number;
  currentBid: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended' | 'cancelled';
  bidCount: number;
  highestBidder: string | null;
}

export function AuctionsManagement() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAuctions([
        {
          id: 'AUC-001',
          title: 'Premium Recycled PET Plastic Batch',
          materialId: 'MAT-001',
          materialName: 'Recycled PET Plastic',
          startPrice: 500,
          currentBid: 750,
          startDate: '2025-08-15T10:00:00',
          endDate: '2025-08-17T10:00:00',
          status: 'active',
          bidCount: 12,
          highestBidder: 'Green Solutions Ltd'
        },
        {
          id: 'AUC-002',
          title: 'Bulk Paper Collection',
          materialId: 'MAT-002',
          materialName: 'Used Paper',
          startPrice: 300,
          currentBid: 300,
          startDate: '2025-08-20T14:00:00',
          endDate: '2025-08-22T14:00:00',
          status: 'upcoming',
          bidCount: 0,
          highestBidder: null
        },
        {
          id: 'AUC-003',
          title: 'Premium Aluminum Scrap Collection',
          materialId: 'MAT-003',
          materialName: 'Aluminum Scrap',
          startPrice: 1200,
          currentBid: 1500,
          startDate: '2025-08-10T09:00:00',
          endDate: '2025-08-12T09:00:00',
          status: 'ended',
          bidCount: 8,
          highestBidder: 'Metal Recyclers Inc'
        },
        {
          id: 'AUC-004',
          title: 'E-Waste Collection Lot',
          materialId: 'MAT-005',
          materialName: 'E-Waste Collection',
          startPrice: 800,
          currentBid: 950,
          startDate: '2025-08-05T11:00:00',
          endDate: '2025-08-07T11:00:00',
          status: 'ended',
          bidCount: 5,
          highestBidder: 'Tech Reclaim Co'
        },
        {
          id: 'AUC-005',
          title: 'Mixed Recyclable Materials',
          materialId: 'MAT-006',
          materialName: 'Mixed Recyclables',
          startPrice: 400,
          currentBid: 400,
          startDate: '2025-08-25T13:00:00',
          endDate: '2025-08-27T13:00:00',
          status: 'upcoming',
          bidCount: 0,
          highestBidder: null
        },
      ] as Auction[]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEditAuction = (auction: Auction) => {
    setCurrentAuction(auction);
    setIsDialogOpen(true);
  };

  const handleCreateAuction = () => {
    setCurrentAuction(null);
    setIsDialogOpen(true);
  };

  const handleCancelAuction = (auctionId: string) => {
    // In a real app, this would make an API call
    setAuctions(auctions.map(auction => 
      auction.id === auctionId ? { ...auction, status: 'cancelled' as const } : auction
    ));
  };

  const handleSaveAuction = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would make an API call
    setIsDialogOpen(false);
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        auction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        auction.materialName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClasses = (status: Auction['status']) => {
    switch(status) {
      case 'upcoming':
        return 'bg-status-pending text-white';
      case 'active':
        return 'bg-status-auction text-white';
      case 'ended':
        return 'bg-status-completed text-white';
      case 'cancelled':
        return 'bg-status-rejected text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Auctions Management</CardTitle>
          <Button onClick={handleCreateAuction}>Create Auction</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by title, ID, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading auctions...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Material</th>
                    <th className="px-4 py-2 text-left">Start Price</th>
                    <th className="px-4 py-2 text-left">Current Bid</th>
                    <th className="px-4 py-2 text-left">Timeframe</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Bids</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-2 text-center">No auctions found</td>
                    </tr>
                  ) : (
                    filteredAuctions.map((auction) => (
                      <tr key={auction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2">{auction.id}</td>
                        <td className="px-4 py-2">{auction.title}</td>
                        <td className="px-4 py-2">{auction.materialName}</td>
                        <td className="px-4 py-2">${auction.startPrice}</td>
                        <td className="px-4 py-2">${auction.currentBid}</td>
                        <td className="px-4 py-2">
                          <div className="text-xs">
                            <div>Start: {formatDate(auction.startDate)}</div>
                            <div>End: {formatDate(auction.endDate)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClasses(auction.status)}`}>
                            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-xs">
                            <div>Count: {auction.bidCount}</div>
                            {auction.highestBidder && <div>Leader: {auction.highestBidder}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAuction(auction)}
                            >
                              Edit
                            </Button>
                            {auction.status === 'upcoming' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleCancelAuction(auction.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auction Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>
            {currentAuction ? 'Edit Auction' : 'Create New Auction'}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <form onSubmit={handleSaveAuction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Auction Title</label>
              <Input 
                placeholder="Enter auction title"
                defaultValue={currentAuction?.title}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                defaultValue={currentAuction?.materialId}
                required
              >
                <option value="">Select material</option>
                <option value="MAT-001">Recycled PET Plastic</option>
                <option value="MAT-002">Used Paper</option>
                <option value="MAT-003">Aluminum Scrap</option>
                <option value="MAT-005">E-Waste Collection</option>
                <option value="MAT-006">Mixed Recyclables</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Price ($)</label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={currentAuction?.startPrice}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reserve Price ($)</label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  placeholder="0.00" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                <Input 
                  type="datetime-local" 
                  defaultValue={currentAuction?.startDate ? currentAuction.startDate.slice(0, 16) : ''}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date & Time</label>
                <Input 
                  type="datetime-local" 
                  defaultValue={currentAuction?.endDate ? currentAuction.endDate.slice(0, 16) : ''}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                defaultValue={currentAuction?.status || 'upcoming'}
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </form>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSaveAuction}>
            {currentAuction ? 'Update Auction' : 'Create Auction'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
