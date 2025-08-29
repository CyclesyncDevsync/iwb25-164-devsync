'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { SupplierType } from '../../types/supplier';

interface ProfileData {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Profile Image
  profileImage?: string;
  
  // Business Information
  businessName?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  website?: string;
  
  // Supplier Type
  supplierType: SupplierType;
  
  // Verification Status
  isVerified: boolean;
  verificationDocuments: {
    identityDocument: boolean;
    businessLicense: boolean;
    taxCertificate: boolean;
    bankDetails: boolean;
  };
  
  // Account Settings
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private';
    contactInfoVisible: boolean;
    showBusinessDetails: boolean;
  };
  
  // Security
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
}

export default function SupplierProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'security' | 'settings'>('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector(state => state.supplier);

  // Mock profile data - replace with actual data from Redux store
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Rajesh Kumar',
    email: 'rajesh@recyclecorp.lk',
    phone: '+94 77 123 4567',
    address: '123 Industrial Road',
    city: 'Colombo',
    state: 'Western Province',
    postalCode: '00100',
    country: 'Sri Lanka',
    profileImage: '/api/placeholder/128/128',
    businessName: 'RecycleCorp Lanka',
    businessRegistrationNumber: 'PV-123456789',
    taxId: 'TAX-987654321',
    website: 'https://recyclecorp.lk',
    supplierType: SupplierType.ORGANIZATION,
    isVerified: true,
    verificationDocuments: {
      identityDocument: true,
      businessLicense: true,
      taxCertificate: false,
      bankDetails: true
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      contactInfoVisible: true,
      showBusinessDetails: true
    },
    twoFactorEnabled: false,
    lastPasswordChange: new Date('2024-06-15')
  });

  const [editedData, setEditedData] = useState(profileData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    // Implement save logic
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Implement image upload logic
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedData({
          ...editedData,
          profileImage: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    // Implement password change logic
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // API call to change password
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordChange(false);
  };

  const getVerificationScore = () => {
    const docs = profileData.verificationDocuments;
    const completed = Object.values(docs).filter(Boolean).length;
    return (completed / Object.keys(docs).length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={editedData.profileImage || '/api/placeholder/128/128'}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 cursor-pointer hover:bg-emerald-700 transition-colors">
                  <CameraIcon className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profileData.name}
                </h3>
                {profileData.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                  {profileData.supplierType === SupplierType.ORGANIZATION ? 'Organization' : 'Individual'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profileData.businessName || 'Individual Supplier'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {profileData.city}, {profileData.country}
              </p>
              
              {/* Verification Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {Math.round(getVerificationScore())}%
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getVerificationScore()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profile Information', icon: UserCircleIcon },
            { id: 'business', label: 'Business Details', icon: BuildingOfficeIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
            { id: 'settings', label: 'Settings', icon: BellIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === 'profile' && (
          <ProfileInformationTab
            data={editedData}
            isEditing={isEditing}
            onChange={setEditedData}
          />
        )}
        
        {activeTab === 'business' && (
          <BusinessDetailsTab
            data={editedData}
            isEditing={isEditing}
            onChange={setEditedData}
          />
        )}
        
        {activeTab === 'security' && (
          <SecurityTab
            data={profileData}
            passwordData={passwordData}
            showPasswordChange={showPasswordChange}
            onPasswordDataChange={setPasswordData}
            onPasswordChange={handlePasswordChange}
            onTogglePasswordChange={setShowPasswordChange}
            onToggle2FA={() => setProfileData({
              ...profileData,
              twoFactorEnabled: !profileData.twoFactorEnabled
            })}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab
            data={profileData}
            onChange={setProfileData}
          />
        )}
      </div>
    </div>
  );
}

// Profile Information Tab Component
interface ProfileInformationTabProps {
  data: ProfileData;
  isEditing: boolean;
  onChange: (data: ProfileData) => void;
}

function ProfileInformationTab({ data, isEditing, onChange }: ProfileInformationTabProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ ...data, email: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ ...data, phone: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          {isEditing ? (
            <select
              value={data.country}
              onChange={(e) => onChange({ ...data, country: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="India">India</option>
              <option value="Bangladesh">Bangladesh</option>
            </select>
          ) : (
            <p className="text-gray-900 dark:text-white">{data.country}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          {isEditing ? (
            <textarea
              value={data.address}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          {isEditing ? (
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ ...data, city: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postal Code
          </label>
          {isEditing ? (
            <input
              type="text"
              value={data.postalCode}
              onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{data.postalCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Business Details Tab Component
interface BusinessDetailsTabProps {
  data: ProfileData;
  isEditing: boolean;
  onChange: (data: ProfileData) => void;
}

function BusinessDetailsTab({ data, isEditing, onChange }: BusinessDetailsTabProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Business Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Supplier Type
          </label>
          <p className="text-gray-900 dark:text-white">
            {data.supplierType === SupplierType.ORGANIZATION ? 'Organization' : 'Individual'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Contact support to change supplier type
          </p>
        </div>

        {data.supplierType === SupplierType.ORGANIZATION && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={data.businessName || ''}
                  onChange={(e) => onChange({ ...data, businessName: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{data.businessName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registration Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={data.businessRegistrationNumber || ''}
                  onChange={(e) => onChange({ ...data, businessRegistrationNumber: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{data.businessRegistrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={data.taxId || ''}
                  onChange={(e) => onChange({ ...data, taxId: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{data.taxId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={data.website || ''}
                  onChange={(e) => onChange({ ...data, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{data.website || 'Not provided'}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Verification Documents */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Verification Documents</h4>
        <div className="space-y-3">
          {Object.entries(data.verificationDocuments).map(([key, completed]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                completed 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {completed ? (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  'Pending'
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
interface SecurityTabProps {
  data: ProfileData;
  passwordData: { currentPassword: string; newPassword: string; confirmPassword: string };
  showPasswordChange: boolean;
  onPasswordDataChange: (data: any) => void;
  onPasswordChange: () => void;
  onTogglePasswordChange: (show: boolean) => void;
  onToggle2FA: () => void;
}

function SecurityTab({ 
  data, 
  passwordData, 
  showPasswordChange, 
  onPasswordDataChange, 
  onPasswordChange, 
  onTogglePasswordChange, 
  onToggle2FA 
}: SecurityTabProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
      
      {/* Password Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Password</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last changed: {data.lastPasswordChange.toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => onTogglePasswordChange(!showPasswordChange)}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Change Password
          </button>
        </div>
        
        {showPasswordChange && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onPasswordChange}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
              >
                Update Password
              </button>
              <button
                onClick={() => onTogglePasswordChange(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={onToggle2FA}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              data.twoFactorEnabled ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
interface SettingsTabProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

function SettingsTab({ data, onChange }: SettingsTabProps) {
  const updateNotificationSetting = (key: keyof ProfileData['notifications'], value: boolean) => {
    onChange({
      ...data,
      notifications: {
        ...data.notifications,
        [key]: value
      }
    });
  };

  const updatePrivacySetting = (key: keyof ProfileData['privacy'], value: any) => {
    onChange({
      ...data,
      privacy: {
        ...data.privacy,
        [key]: value
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
      
      {/* Notification Preferences */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h4>
        <div className="space-y-4">
          {Object.entries(data.notifications).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key} Notifications
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'sms' && 'Receive notifications via SMS'}
                  {key === 'push' && 'Receive push notifications in browser'}
                  {key === 'marketing' && 'Receive promotional and marketing emails'}
                </p>
              </div>
              <button
                onClick={() => updateNotificationSetting(key as any, !enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  enabled ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={data.privacy.profileVisibility}
              onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="public">Public - Visible to all users</option>
              <option value="private">Private - Only visible to connected users</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Contact Information
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow other users to see your contact details
              </p>
            </div>
            <button
              onClick={() => updatePrivacySetting('contactInfoVisible', !data.privacy.contactInfoVisible)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                data.privacy.contactInfoVisible ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  data.privacy.contactInfoVisible ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Business Details
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Display business information on your profile
              </p>
            </div>
            <button
              onClick={() => updatePrivacySetting('showBusinessDetails', !data.privacy.showBusinessDetails)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                data.privacy.showBusinessDetails ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  data.privacy.showBusinessDetails ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
