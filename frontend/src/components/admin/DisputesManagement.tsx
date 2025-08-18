import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';

interface Dispute {
  id: string;
  title: string;
  description: string;
  reportedBy: {
    id: string;
    name: string;
    role: 'supplier' | 'buyer' | 'agent';
  };
  against: {
    id: string;
    name: string;
    role: 'supplier' | 'buyer' | 'agent';
  };
  relatedTo: {
    type: 'auction' | 'transaction' | 'material';
    id: string;
    name: string;
  };
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export function DisputesManagement() {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'disp1',
      title: 'Material Quality Issue',
      description: 'The received material quality does not match the description provided in the listing.',
      reportedBy: {
        id: 'b1',
        name: 'EcoManufacturing Inc.',
        role: 'buyer'
      },
      against: {
        id: 's1',
        name: 'Green Metals Co.',
        role: 'supplier'
      },
      relatedTo: {
        type: 'material',
        id: 'm1',
        name: 'Recycled Aluminum'
      },
      status: 'pending',
      createdAt: '2025-08-15T14:30:00Z',
      updatedAt: '2025-08-15T14:30:00Z'
    },
    {
      id: 'disp2',
      title: 'Payment Delay',
      description: 'Buyer has not completed payment within the agreed timeframe.',
      reportedBy: {
        id: 's2',
        name: 'Recycle Plus',
        role: 'supplier'
      },
      against: {
        id: 'b2',
        name: 'Sustainable Products Ltd.',
        role: 'buyer'
      },
      relatedTo: {
        type: 'transaction',
        id: 'tx2',
        name: 'Transaction #TX-2023-08-14-001'
      },
      status: 'in_review',
      createdAt: '2025-08-14T09:15:00Z',
      updatedAt: '2025-08-16T10:20:00Z'
    },
    {
      id: 'disp3',
      title: 'Auction Process Complaint',
      description: 'Supplier claims the auction process was unfair due to technical issues.',
      reportedBy: {
        id: 's3',
        name: 'Paper Loop',
        role: 'supplier'
      },
      against: {
        id: 'a1',
        name: 'System',
        role: 'agent'
      },
      relatedTo: {
        type: 'auction',
        id: 'auc3',
        name: 'Auction #AUC-2023-08-10-003'
      },
      status: 'resolved',
      createdAt: '2025-08-13T16:45:00Z',
      updatedAt: '2025-08-17T13:30:00Z'
    },
    {
      id: 'disp4',
      title: 'Delivery Issue',
      description: 'Materials were not delivered according to the agreed timeline.',
      reportedBy: {
        id: 'b4',
        name: 'Bottle Recyclers Co.',
        role: 'buyer'
      },
      against: {
        id: 's4',
        name: 'GlassWorks',
        role: 'supplier'
      },
      relatedTo: {
        type: 'transaction',
        id: 'tx4',
        name: 'Transaction #TX-2023-08-10-004'
      },
      status: 'dismissed',
      createdAt: '2025-08-10T11:20:00Z',
      updatedAt: '2025-08-12T09:45:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const openDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setIsDetailsOpen(true);
  };

  const openResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolutionNotes('');
    setIsResolveOpen(true);
  };

  const handleResolve = () => {
    if (selectedDispute) {
      setDisputes(disputes.map(d => 
        d.id === selectedDispute.id 
          ? { 
              ...d, 
              status: 'resolved', 
              updatedAt: new Date().toISOString() 
            } 
          : d
      ));
      setIsResolveOpen(false);
    }
  };

  const handleDismiss = () => {
    if (selectedDispute) {
      setDisputes(disputes.map(d => 
        d.id === selectedDispute.id 
          ? { 
              ...d, 
              status: 'dismissed', 
              updatedAt: new Date().toISOString() 
            } 
          : d
      ));
      setIsResolveOpen(false);
    }
  };

  const handleStatusChange = (disputeId: string, newStatus: Dispute['status']) => {
    setDisputes(disputes.map(d => 
      d.id === disputeId 
        ? { 
            ...d, 
            status: newStatus, 
            updatedAt: new Date().toISOString() 
          } 
        : d
    ));
  };

  // Filter disputes based on search term and status filter
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reportedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.against.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: Dispute['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Dispute['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_review':
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      case 'dismissed':
        return 'Dismissed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
            <select 
              className="h-10 rounded-md border border-input px-3"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">Reported By</th>
                  <th className="text-left p-2">Against</th>
                  <th className="text-left p-2">Related To</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map(dispute => (
                  <tr key={dispute.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{dispute.title}</td>
                    <td className="p-2">{dispute.reportedBy.name}</td>
                    <td className="p-2">{dispute.against.name}</td>
                    <td className="p-2">{dispute.relatedTo.name}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(dispute.status)}`}>
                        {getStatusText(dispute.status)}
                      </span>
                    </td>
                    <td className="p-2">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(dispute)}
                        >
                          View
                        </Button>
                        {(dispute.status === 'pending' || dispute.status === 'in_review') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openResolve(dispute)}
                          >
                            Resolve
                          </Button>
                        )}
                        {dispute.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(dispute.id, 'in_review')}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      {selectedDispute && (
        <Dialog 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1 font-medium">{selectedDispute.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{selectedDispute.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                <p className="mt-1">{selectedDispute.reportedBy.name} ({selectedDispute.reportedBy.role})</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Against</h3>
                <p className="mt-1">{selectedDispute.against.name} ({selectedDispute.against.role})</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Related To</h3>
              <p className="mt-1">{selectedDispute.relatedTo.name} ({selectedDispute.relatedTo.type})</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedDispute.status)}`}>
                    {getStatusText(selectedDispute.status)}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{new Date(selectedDispute.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1">{new Date(selectedDispute.updatedAt).toLocaleString()}</p>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              {(selectedDispute.status === 'pending' || selectedDispute.status === 'in_review') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDetailsOpen(false);
                    openResolve(selectedDispute);
                  }}
                >
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Resolve Dispute Dialog */}
      {selectedDispute && (
        <Dialog 
          isOpen={isResolveOpen} 
          onClose={() => setIsResolveOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1 font-medium">{selectedDispute.title}</p>
            </div>
            <div>
              <label htmlFor="resolution-notes" className="block text-sm font-medium text-gray-700">
                Resolution Notes
              </label>
              <textarea
                id="resolution-notes"
                rows={4}
                className="mt-1 w-full rounded-md border border-input px-3 py-2"
                placeholder="Enter notes about the resolution..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsResolveOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
              <Button 
                type="button"
                onClick={handleResolve}
              >
                Resolve
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
