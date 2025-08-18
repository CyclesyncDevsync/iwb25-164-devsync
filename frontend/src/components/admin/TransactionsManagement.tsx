import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
// import { Select } from '../ui/Select';
import { Dialog } from '../ui/Dialog';

interface Transaction {
  id: string;
  materialName: string;
  materialId: string;
  buyerName: string;
  buyerId: string;
  supplierName: string;
  supplierId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  type: 'auction' | 'direct' | 'marketplace';
}

export function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      materialName: 'Recycled Aluminum',
      materialId: 'm1',
      buyerName: 'EcoManufacturing Inc.',
      buyerId: 'b1',
      supplierName: 'Green Metals Co.',
      supplierId: 's1',
      amount: 1550,
      date: '2025-08-15T14:30:00Z',
      status: 'completed',
      type: 'auction'
    },
    {
      id: 'tx2',
      materialName: 'Mixed Plastics',
      materialId: 'm2',
      buyerName: 'Sustainable Products Ltd.',
      buyerId: 'b2',
      supplierName: 'Recycle Plus',
      supplierId: 's2',
      amount: 850,
      date: '2025-08-14T09:15:00Z',
      status: 'pending',
      type: 'direct'
    },
    {
      id: 'tx3',
      materialName: 'Used Cardboard',
      materialId: 'm3',
      buyerName: 'Packaging Solutions',
      buyerId: 'b3',
      supplierName: 'Paper Loop',
      supplierId: 's3',
      amount: 650,
      date: '2025-08-13T16:45:00Z',
      status: 'disputed',
      type: 'marketplace'
    },
    {
      id: 'tx4',
      materialName: 'Glass Bottles',
      materialId: 'm4',
      buyerName: 'Bottle Recyclers Co.',
      buyerId: 'b4',
      supplierName: 'GlassWorks',
      supplierId: 's4',
      amount: 420,
      date: '2025-08-10T11:20:00Z',
      status: 'completed',
      type: 'auction'
    },
    {
      id: 'tx5',
      materialName: 'Scrap Metal',
      materialId: 'm5',
      buyerName: 'Metal Reusers Inc.',
      buyerId: 'b5',
      supplierName: 'Green Metals Co.',
      supplierId: 's1',
      amount: 2200,
      date: '2025-08-08T13:10:00Z',
      status: 'cancelled',
      type: 'direct'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const updateTransactionStatus = (transactionId: string, newStatus: Transaction['status']) => {
    setTransactions(transactions.map(tx => 
      tx.id === transactionId ? { ...tx, status: newStatus } : tx
    ));
    
    if (selectedTransaction?.id === transactionId) {
      setSelectedTransaction({ ...selectedTransaction, status: newStatus });
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Cancelled</span>;
      case 'disputed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Disputed</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'auction':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Auction</span>;
      case 'direct':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Direct</span>;
      case 'marketplace':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">Marketplace</span>;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions Management</CardTitle>
          <div className="flex space-x-2">
            <Button variant="default">Export</Button>
            <Button variant="default">Generate Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
            {/* Replace Select with standard HTML select */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full sm:w-40 rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
            
            {/* Replace Select with standard HTML select */}
            <select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              className="w-full sm:w-40 rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Types</option>
              <option value="auction">Auction</option>
              <option value="direct">Direct</option>
              <option value="marketplace">Marketplace</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-3 text-sm font-mono">{transaction.id}</td>
                    <td className="p-3 text-sm">{transaction.materialName}</td>
                    <td className="p-3 text-sm">{transaction.buyerName}</td>
                    <td className="p-3 text-sm">{transaction.supplierName}</td>
                    <td className="p-3 text-sm font-medium">${transaction.amount}</td>
                    <td className="p-3 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{getTypeBadge(transaction.type)}</td>
                    <td className="p-3 text-sm">{getStatusBadge(transaction.status)}</td>
                    <td className="p-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => viewTransactionDetails(transaction)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </button>
                        {transaction.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => updateTransactionStatus(transaction.id, 'cancelled')}
                              className="text-gray-600 hover:text-gray-800 text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {transaction.status === 'disputed' && (
                          <button 
                            onClick={() => updateTransactionStatus(transaction.id, 'completed')}
                            className="text-green-600 hover:text-green-800 text-xs"
                          >
                            Resolve
                          </button>
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

      {/* Transaction Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-3xl font-bold mt-2">{transactions.length}</p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-green-500">↑ 12%</span> from last month
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-3xl font-bold mt-2">
                ${transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-green-500">↑ 8%</span> from last month
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Pending Transactions</p>
              <p className="text-3xl font-bold mt-2">
                {transactions.filter(tx => tx.status === 'pending').length}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-amber-500">Requires attention</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-500">Disputed Transactions</p>
              <p className="text-3xl font-bold mt-2">
                {transactions.filter(tx => tx.status === 'disputed').length}
              </p>
              <div className="mt-2 text-sm text-gray-500">
                <span className="text-red-500">Needs resolution</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Dialog - use conditional rendering instead */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Transaction Details</h3>
                <button 
                  onClick={() => setDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {selectedTransaction && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm text-gray-500">ID: {selectedTransaction.id}</span>
                      <h4 className="font-bold text-lg">{selectedTransaction.materialName}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(selectedTransaction.status)}
                      <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                    </div>
                  </div>
                  
                  <div className="py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="font-bold text-lg text-center">${selectedTransaction.amount}</div>
                    <div className="text-xs text-center text-gray-500">Transaction Amount</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Buyer</p>
                      <p className="font-medium">{selectedTransaction.buyerName}</p>
                      <p className="text-xs text-gray-500">ID: {selectedTransaction.buyerId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Supplier</p>
                      <p className="font-medium">{selectedTransaction.supplierName}</p>
                      <p className="text-xs text-gray-500">ID: {selectedTransaction.supplierId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Material ID</p>
                      <p>{selectedTransaction.materialId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Transaction Date</p>
                      <p>{new Date(selectedTransaction.date).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-medium mb-2">Transaction Timeline</h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-4 w-4 mt-0.5 rounded-full bg-blue-500 mr-2"></div>
                        <div>
                          <p className="text-sm font-medium">Transaction Created</p>
                          <p className="text-xs text-gray-500">{new Date(selectedTransaction.date).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {selectedTransaction.status !== 'pending' && (
                        <div className="flex items-start">
                          <div className={`h-4 w-4 mt-0.5 rounded-full mr-2 
                            ${selectedTransaction.status === 'completed' ? 'bg-green-500' : 
                              selectedTransaction.status === 'cancelled' ? 'bg-gray-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="text-sm font-medium">
                              {selectedTransaction.status === 'completed' ? 'Transaction Completed' : 
                                selectedTransaction.status === 'cancelled' ? 'Transaction Cancelled' : 'Dispute Opened'}
                            </p>
                            <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedTransaction.status === 'disputed' && (
                        <div className="flex items-start">
                          <div className="h-4 w-4 mt-0.5 rounded-full bg-amber-500 mr-2"></div>
                          <div>
                            <p className="text-sm font-medium">Awaiting Resolution</p>
                            <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedTransaction.status === 'disputed' && (
                    <div className="border-t pt-4 mt-4">
                      <h5 className="font-medium mb-2">Dispute Information</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Reason: Material quality does not match description
                      </p>
                      <p className="text-sm text-gray-600">
                        The buyer has reported that the received material does not meet the quality standards specified in the listing. Verification required from an agent.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    {selectedTransaction.status === 'pending' && (
                      <>
                        <Button 
                          variant="secondary"
                          onClick={() => updateTransactionStatus(selectedTransaction.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="default"
                          onClick={() => updateTransactionStatus(selectedTransaction.id, 'completed')}
                        >
                          Complete
                        </Button>
                      </>
                    )}
                    {selectedTransaction.status === 'disputed' && (
                      <Button 
                        variant="default"
                        onClick={() => updateTransactionStatus(selectedTransaction.id, 'completed')}
                      >
                        Resolve Dispute
                      </Button>
                    )}
                    <Button 
                      variant="default"
                      onClick={() => setDetailsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
