import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '../ui/Dialog';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'supplier' | 'buyer';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user1',
      name: 'John Admin',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2025-07-01T10:00:00Z'
    },
    {
      id: 'user2',
      name: 'Alice Agent',
      email: 'alice@example.com',
      role: 'agent',
      status: 'active',
      joinedAt: '2025-07-15T14:30:00Z'
    },
    {
      id: 'user3',
      name: 'Bob Supplier',
      email: 'bob@example.com',
      role: 'supplier',
      status: 'pending',
      joinedAt: '2025-08-01T09:15:00Z'
    },
    {
      id: 'user4',
      name: 'Carol Buyer',
      email: 'carol@example.com',
      role: 'buyer',
      status: 'active',
      joinedAt: '2025-07-20T16:45:00Z'
    },
    {
      id: 'user5',
      name: 'David Supplier',
      email: 'david@example.com',
      role: 'supplier',
      status: 'inactive',
      joinedAt: '2025-06-10T11:20:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleStatusChange = (userId: string, newStatus: User['status']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const openDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const openEdit = (user: User) => {
    setEditForm({ ...user });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.id) {
      setUsers(users.map(user => 
        user.id === editForm.id ? { ...user, ...editForm } as User : user
      ));
      setIsEditOpen(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
            <div className="flex flex-wrap gap-2">
              <select 
                className="h-10 rounded-md border border-input px-3"
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="supplier">Supplier</option>
                <option value="buyer">Buyer</option>
              </select>
              
              <select 
                className="h-10 rounded-md border border-input px-3"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Joined</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'agent' ? 'bg-blue-100 text-blue-800' : 
                        user.role === 'supplier' ? 'bg-green-100 text-green-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-2">{new Date(user.joinedAt).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(user)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'active')}
                          >
                            Activate
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

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{selectedUser.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{selectedUser.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <p className="mt-1">{selectedUser.role}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">{selectedUser.status}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Joined</h3>
              <p className="mt-1">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDetailsOpen(false);
                  openEdit(selectedUser);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      <Dialog 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={editForm.name || ''}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editForm.email || ''}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 h-10 w-full rounded-md border border-input px-3"
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value as User['role']})}
              >
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="supplier">Supplier</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 h-10 w-full rounded-md border border-input px-3"
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value as User['status']})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
