import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog } from '../ui/Dialog';

interface Material {
  id: string;
  name: string;
  category: string;
  supplier: string;
  quantity: number;
  unit: string;
  quality: string;
  status: 'pending' | 'verified' | 'rejected' | 'in_auction' | 'sold';
  createdAt: string;
}

export function MaterialsManagement() {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: '1',
      name: 'Recycled Aluminum',
      category: 'Metals',
      supplier: 'Green Metals Co.',
      quantity: 500,
      unit: 'kg',
      quality: 'High',
      status: 'verified',
      createdAt: '2025-08-12T10:30:00Z',
    },
    {
      id: '2',
      name: 'Mixed Plastics',
      category: 'Plastics',
      supplier: 'Recycle Plus',
      quantity: 1200,
      unit: 'kg',
      quality: 'Medium',
      status: 'pending',
      createdAt: '2025-08-15T14:20:00Z',
    },
    {
      id: '3',
      name: 'Used Cardboard',
      category: 'Paper',
      supplier: 'Paper Loop',
      quantity: 800,
      unit: 'kg',
      quality: 'Medium',
      status: 'in_auction',
      createdAt: '2025-08-10T09:15:00Z',
    },
    {
      id: '4',
      name: 'Glass Bottles',
      category: 'Glass',
      supplier: 'GlassWorks',
      quantity: 350,
      unit: 'kg',
      quality: 'High',
      status: 'sold',
      createdAt: '2025-08-05T11:45:00Z',
    },
    {
      id: '5',
      name: 'E-Waste Components',
      category: 'Electronics',
      supplier: 'TechRecycle',
      quantity: 200,
      unit: 'kg',
      quality: 'Low',
      status: 'rejected',
      createdAt: '2025-08-14T16:30:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Material>>({});

  const handleStatusChange = (materialId: string, newStatus: Material['status']) => {
    setMaterials(materials.map(m => 
      m.id === materialId ? { ...m, status: newStatus } : m
    ));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const openDetails = (material: Material) => {
    setSelectedMaterial(material);
    setIsDetailsOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditForm(material);
    setIsEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = () => {
    if (editForm.id) {
      setMaterials(materials.map(m => 
        m.id === editForm.id ? { ...m, ...editForm } as Material : m
      ));
      setIsEditOpen(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: Material['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_auction': return 'bg-purple-100 text-purple-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(materials.map(m => m.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Materials Management</CardTitle>
          <Button variant="default">Add New Material</Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search materials or suppliers..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded-md border border-gray-300 bg-white p-2 w-full sm:w-40 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="in_auction">In Auction</option>
              <option value="sold">Sold</option>
            </select>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              className="rounded-md border border-gray-300 bg-white p-2 w-full sm:w-40 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMaterials.map((material) => (
                  <tr 
                    key={material.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-3 text-sm">
                      <div className="font-medium">{material.name}</div>
                      <div className="text-xs text-gray-500">{material.category}</div>
                    </td>
                    <td className="p-3 text-sm">{material.supplier}</td>
                    <td className="p-3 text-sm">{material.quantity} {material.unit}</td>
                    <td className="p-3 text-sm">{material.quality}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(material.status)}`}>
                        {material.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openDetails(material)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => openEdit(material)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Edit
                        </button>
                        {material.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(material.id, 'verified')}
                              className="text-green-600 hover:text-green-800 text-xs"
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => handleStatusChange(material.id, 'rejected')}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Material Details Dialog */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Material Details</h3>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {selectedMaterial && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{selectedMaterial.name}</h4>
                      <p className="text-sm text-gray-500">{selectedMaterial.category}</p>
                    </div>
                    <span className={`px-2 py-1 h-fit rounded-full text-xs ${getStatusColor(selectedMaterial.status)}`}>
                      {selectedMaterial.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Supplier</p>
                      <p>{selectedMaterial.supplier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created At</p>
                      <p>{new Date(selectedMaterial.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p>{selectedMaterial.quantity} {selectedMaterial.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p>{selectedMaterial.quality}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-medium mb-2">Material Description</h5>
                    <p className="text-sm text-gray-600">
                      This is a sample description for {selectedMaterial.name}. 
                      In a real application, this would contain detailed information about the material properties, 
                      condition, and any other relevant details provided by the supplier or verified by agents.
                    </p>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-medium mb-2">Verification History</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p>Submitted for verification</p>
                        <p className="text-gray-500">Aug 10, 2025</p>
                      </div>
                      {selectedMaterial.status !== 'pending' && (
                        <div className="flex justify-between">
                          <p>{selectedMaterial.status === 'verified' ? 'Verified by Agent' : 'Rejected by Agent'}</p>
                          <p className="text-gray-500">Aug 12, 2025</p>
                        </div>
                      )}
                      {selectedMaterial.status === 'in_auction' && (
                        <div className="flex justify-between">
                          <p>Added to auction</p>
                          <p className="text-gray-500">Aug 13, 2025</p>
                        </div>
                      )}
                      {selectedMaterial.status === 'sold' && (
                        <>
                          <div className="flex justify-between">
                            <p>Added to auction</p>
                            <p className="text-gray-500">Aug 13, 2025</p>
                          </div>
                          <div className="flex justify-between">
                            <p>Sold to buyer</p>
                            <p className="text-gray-500">Aug 15, 2025</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    {selectedMaterial.status === 'pending' && (
                      <>
                        <Button 
                          variant="secondary" 
                          onClick={() => {
                            handleStatusChange(selectedMaterial.id, 'rejected');
                            setIsDetailsOpen(false);
                          }}
                        >
                          Reject
                        </Button>
                        <Button 
                          variant="default"
                          onClick={() => {
                            handleStatusChange(selectedMaterial.id, 'verified');
                            setIsDetailsOpen(false);
                          }}
                        >
                          Verify
                        </Button>
                      </>
                    )}
                    {selectedMaterial.status === 'verified' && (
                      <Button 
                        variant="default"
                        onClick={() => {
                          handleStatusChange(selectedMaterial.id, 'in_auction');
                          setIsDetailsOpen(false);
                        }}
                      >
                        Add to Auction
                      </Button>
                    )}
                    <Button 
                      variant="secondary"
                      onClick={() => setIsDetailsOpen(false)}
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

      {/* Edit Material Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Edit Material</h3>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Name
                  </label>
                  <Input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleEditChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={editForm.category || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <Input
                      name="supplier"
                      value={editForm.supplier || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      value={editForm.quantity || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={editForm.unit || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                      <option value="m3">m³</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality
                    </label>
                    <select
                      name="quality"
                      value={editForm.quality || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editForm.status || ''}
                      onChange={handleEditChange}
                      className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="in_auction">In Auction</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="secondary"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleEditSubmit}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
