'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  TeamMember,
  TeamRole,
  Permission,
  SupplierType
} from '../../types/supplier';

const rolePermissions: Record<TeamRole, Permission[]> = {
  [TeamRole.ADMIN]: [
    Permission.CREATE_MATERIALS,
    Permission.EDIT_MATERIALS,
    Permission.DELETE_MATERIALS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_TEAM,
    Permission.MANAGE_SETTINGS,
    Permission.APPROVE_MATERIALS
  ],
  [TeamRole.MANAGER]: [
    Permission.CREATE_MATERIALS,
    Permission.EDIT_MATERIALS,
    Permission.VIEW_ANALYTICS,
    Permission.APPROVE_MATERIALS
  ],
  [TeamRole.OPERATOR]: [
    Permission.CREATE_MATERIALS,
    Permission.EDIT_MATERIALS
  ],
  [TeamRole.VIEWER]: [
    Permission.VIEW_ANALYTICS
  ]
};

export default function TeamManagement() {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.supplier);

  // Mock team data - replace with actual API calls
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: TeamRole.MANAGER,
      permissions: rolePermissions[TeamRole.MANAGER],
      addedAt: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: TeamRole.OPERATOR,
      permissions: rolePermissions[TeamRole.OPERATOR],
      addedAt: new Date('2024-02-01'),
      isActive: true
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@company.com',
      role: TeamRole.VIEWER,
      permissions: rolePermissions[TeamRole.VIEWER],
      addedAt: new Date('2024-02-15'),
      isActive: false
    }
  ]);

  if (profile?.type !== SupplierType.ORGANIZATION) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Team Management Not Available
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Team management is only available for organization accounts.
        </p>
      </div>
    );
  }

  const handleAddMember = (memberData: Partial<TeamMember>) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: memberData.name!,
      email: memberData.email!,
      role: memberData.role!,
      permissions: rolePermissions[memberData.role!],
      addedAt: new Date(),
      isActive: true
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowAddMember(false);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    setSelectedMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  const handleToggleStatus = (memberId: string) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === memberId 
          ? { ...member, isActive: !member.isActive }
          : member
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your organization's team members and their permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowAddMember(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TeamStatCard
          title="Total Members"
          value={teamMembers.length}
          subtitle="Active team members"
          color="blue"
        />
        <TeamStatCard
          title="Active Members"
          value={teamMembers.filter(m => m.isActive).length}
          subtitle="Currently active"
          color="emerald"
        />
        <TeamStatCard
          title="Admins"
          value={teamMembers.filter(m => m.role === TeamRole.ADMIN).length}
          subtitle="Admin privileges"
          color="purple"
        />
        <TeamStatCard
          title="Pending"
          value={teamMembers.filter(m => !m.isActive).length}
          subtitle="Inactive accounts"
          color="yellow"
        />
      </div>

      {/* Team Members Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Team Members
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage permissions and access for your team members
          </p>
        </div>
        
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {teamMembers.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              onEdit={() => setSelectedMember(member)}
              onDelete={() => {
                setSelectedMember(member);
                setShowDeleteModal(true);
              }}
              onToggleStatus={() => handleToggleStatus(member.id)}
            />
          ))}
        </ul>

        {teamMembers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No team members</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first team member.
            </p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAdd={handleAddMember}
        />
      )}

      {/* Edit Member Modal */}
      {selectedMember && !showDeleteModal && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={handleUpdateMember}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <DeleteMemberModal
          member={selectedMember}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onDelete={() => handleDeleteMember(selectedMember.id)}
        />
      )}
    </div>
  );
}

interface TeamStatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'emerald' | 'purple' | 'yellow';
}

function TeamStatCard({ title, value, subtitle, color }: TeamStatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-md p-3 ${colorClasses[color]}`}>
              <UserIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {value}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TeamMemberRowProps {
  member: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

function TeamMemberRow({ member, onEdit, onDelete, onToggleStatus }: TeamMemberRowProps) {
  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case TeamRole.ADMIN:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case TeamRole.MANAGER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case TeamRole.OPERATOR:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case TeamRole.VIEWER:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <li className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="ml-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {member.name}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {member.role}
            </span>
            {member.isActive ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" title="Active" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500" title="Inactive" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {member.email}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Added {member.addedAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleStatus}
          className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
            member.isActive
              ? 'text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
              : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
          }`}
        >
          {member.isActive ? 'Deactivate' : 'Activate'}
        </button>
        
        <button
          onClick={onEdit}
          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
        >
          <PencilIcon className="h-3 w-3 mr-1" />
          Edit
        </button>
        
        <button
          onClick={onDelete}
          className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Delete
        </button>
      </div>
    </li>
  );
}

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (member: Partial<TeamMember>) => void;
}

function AddMemberModal({ onClose, onAdd }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: TeamRole.VIEWER
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 sm:mx-0 sm:h-10 sm:w-10">
                  <UserIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Add Team Member
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {Object.values(TeamRole).map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Permissions for {formData.role}:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {rolePermissions[formData.role].map(permission => (
                          <li key={permission} className="flex items-center">
                            <CheckCircleIcon className="h-3 w-3 text-emerald-500 mr-1" />
                            {permission.replace(/_/g, ' ').toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EditMemberModalProps {
  member: TeamMember;
  onClose: () => void;
  onUpdate: (member: TeamMember) => void;
}

function EditMemberModal({ member, onClose, onUpdate }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    role: member.role
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...member,
      ...formData,
      permissions: rolePermissions[formData.role]
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
                  <PencilIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Edit Team Member
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {Object.values(TeamRole).map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Permissions for {formData.role}:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {rolePermissions[formData.role].map(permission => (
                          <li key={permission} className="flex items-center">
                            <CheckCircleIcon className="h-3 w-3 text-emerald-500 mr-1" />
                            {permission.replace(/_/g, ' ').toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Update Member
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DeleteMemberModalProps {
  member: TeamMember;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteMemberModal({ member, onClose, onDelete }: DeleteMemberModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Remove Team Member
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to remove {member.name} from your team? 
                    They will lose access to all organization features and data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onDelete}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Remove Member
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
