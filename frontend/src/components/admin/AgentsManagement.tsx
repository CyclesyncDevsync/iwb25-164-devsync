'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  User, 
  CreateUserRequest,
  UpdateUserRequest,
  userBasedAgentManagementService 
} from '../../services/userBasedAgentManagement';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AgentsManagement() {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Form states
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'agent'
  });

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userBasedAgentManagementService.getAgents();
      
      // Ensure we always have an array
      const agentsData = response?.data?.agents;
      if (Array.isArray(agentsData)) {
        setAgents(agentsData);
      } else {
        console.warn('Invalid agents data received:', response);
        setAgents([]);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
      setAgents([]); // Ensure agents is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  // Load agents on component mount and when filter changes
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      await userBasedAgentManagementService.createAgent(createForm);
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'agent'
      });
      await loadAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateAgent = async (agentData: UpdateUserRequest) => {
    if (!selectedAgent?.id) return;
    
    try {
      setActionLoading('update');
      const response = await userBasedAgentManagementService.updateAgent(selectedAgent.id, agentData);
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id ? response.data : agent
      ));
      setShowEditModal(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error; // Re-throw to let the modal handle the error display
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAgent = async (agent: User) => {
    if (!agent.id) return;
    
    if (!confirm(`Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(agent.id);
      await userBasedAgentManagementService.deleteAgent(agent.id);
      setAgents(prev => prev.filter(a => a.id !== agent.id));
    } catch (error) {
      console.error('Failed to delete agent:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value
    });
  };

  const filteredAgents = Array.isArray(agents) ? agents.filter(agent => {
    const matchesSearch = (agent.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 'suspended':
        return 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'inactive':
        return <ClockIcon className="h-4 w-4" />;
      case 'suspended':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            </div>

          {/* Add Agent Button */}
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {agent.email}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {getStatusIcon(agent.status)}
                  <span className="ml-1 capitalize">{agent.status}</span>
                </span>
              </div>

              {/* Agent Info */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Role: {agent.role}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-2" />
                  ID: {agent.id}
                </div>
                {agent.created_at && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelectedAgent(agent);
                    setEditForm({
                      firstName: agent.firstName,
                      lastName: agent.lastName,
                      email: agent.email,
                      status: agent.status
                    });
                    setShowEditModal(true);
                  }}
                  disabled={actionLoading === agent.id}
                  className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                  title="Edit Agent"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAgent(agent)}
                  disabled={actionLoading === agent.id}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete Agent"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No agents found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create agents through User Management.'}
          </p>
        </div>
      )}
    </div>

      {/* Modals */}
      
      {/* Create Agent Modal */}
      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateAgent}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <Input
                name="firstName"
                value={createForm.firstName}
                onChange={handleCreateChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <Input
                name="lastName"
                value={createForm.lastName}
                onChange={handleCreateChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={createForm.email}
                onChange={handleCreateChange}
                required
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Role:</strong> Agent (automatically assigned)
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading === 'create'}
              >
                {actionLoading === 'create' ? 'Creating...' : 'Create Agent'}
              </Button>
            </div>
          </div>
        </form>
      </Dialog>

      {/* Edit Agent Modal */}
      <Dialog
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAgent(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>
        {selectedAgent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <Input
                name="firstName"
                value={editForm.firstName || selectedAgent.firstName || ''}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <Input
                name="lastName"
                value={editForm.lastName || selectedAgent.lastName || ''}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={editForm.email || selectedAgent.email}
                onChange={handleEditChange}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={editForm.status || selectedAgent.status || 'active'}
                onChange={handleEditChange}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAgent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateAgent(editForm)}
                disabled={actionLoading === 'update'}
              >
                {actionLoading === 'update' ? 'Updating...' : 'Update Agent'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}