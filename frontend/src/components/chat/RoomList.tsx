'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { setCurrentConversation } from '../../store/slices/chatSlice';
import {
  SpeakerWaveIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  MapPinIcon,
  TruckIcon,
  ShoppingBagIcon,
  UsersIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface RoomListProps {
  userRole: string;
  onRoomSelect: (roomId: string) => void;
  currentConversationId: string | null;
}

interface Room {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'admin' | 'agents' | 'suppliers' | 'buyers' | 'support' | 'announcements';
  isPrivate: boolean;
  memberCount: number;
  onlineCount: number;
  isJoined: boolean;
  canJoin: boolean;
  lastActivity?: string;
  unreadCount?: number;
}

export const RoomList: React.FC<RoomListProps> = ({
  userRole,
  onRoomSelect,
  currentConversationId,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { unreadCounts } = useSelector((state: RootState) => state.chat);

  // Define available rooms based on user role
  const getAvailableRooms = (): Room[] => {
    const baseRooms: Room[] = [
      {
        id: 'general',
        name: t('chat.rooms.general') || 'General Discussion',
        description: 'Open discussion for all users',
        type: 'general',
        isPrivate: false,
        memberCount: 125,
        onlineCount: 23,
        isJoined: true,
        canJoin: true,
        lastActivity: new Date().toISOString(),
        unreadCount: unreadCounts['general'] || 0,
      },
      {
        id: 'announcements',
        name: t('chat.rooms.announcements') || 'Announcements',
        description: 'Official platform announcements',
        type: 'announcements',
        isPrivate: false,
        memberCount: 1250,
        onlineCount: 0,
        isJoined: true,
        canJoin: true,
        lastActivity: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        unreadCount: unreadCounts['announcements'] || 0,
      },
      {
        id: 'support',
        name: t('chat.rooms.support') || 'Customer Support',
        description: 'Get help from our support team',
        type: 'support',
        isPrivate: false,
        memberCount: 45,
        onlineCount: 5,
        isJoined: false,
        canJoin: true,
        lastActivity: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        unreadCount: unreadCounts['support'] || 0,
      },
    ];

    // Add role-specific rooms
    switch (userRole) {
      case 'admin':
        baseRooms.push(
          {
            id: 'admin',
            name: t('chat.rooms.admin') || 'Admin Channel',
            description: 'Private channel for administrators',
            type: 'admin',
            isPrivate: true,
            memberCount: 12,
            onlineCount: 4,
            isJoined: true,
            canJoin: true,
            lastActivity: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            unreadCount: unreadCounts['admin'] || 0,
          }
        );
        break;
      
      case 'agent':
        baseRooms.push(
          {
            id: 'agents',
            name: t('chat.rooms.agents') || 'Field Agents',
            description: 'Coordination hub for field agents',
            type: 'agents',
            isPrivate: false,
            memberCount: 67,
            onlineCount: 15,
            isJoined: true,
            canJoin: true,
            lastActivity: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
            unreadCount: unreadCounts['agents'] || 0,
          }
        );
        break;
      
      case 'supplier':
        baseRooms.push(
          {
            id: 'suppliers',
            name: t('chat.rooms.suppliers') || 'Suppliers Hub',
            description: 'Community for material suppliers',
            type: 'suppliers',
            isPrivate: false,
            memberCount: 234,
            onlineCount: 42,
            isJoined: true,
            canJoin: true,
            lastActivity: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            unreadCount: unreadCounts['suppliers'] || 0,
          }
        );
        break;
      
      case 'buyer':
        baseRooms.push(
          {
            id: 'buyers',
            name: t('chat.rooms.buyers') || 'Buyers Forum',
            description: 'Discussion forum for buyers',
            type: 'buyers',
            isPrivate: false,
            memberCount: 189,
            onlineCount: 38,
            isJoined: true,
            canJoin: true,
            lastActivity: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
            unreadCount: unreadCounts['buyers'] || 0,
          }
        );
        break;
    }

    return baseRooms;
  };

  const getRoomIcon = (type: Room['type']) => {
    switch (type) {
      case 'general':
        return SpeakerWaveIcon;
      case 'admin':
        return ShieldCheckIcon;
      case 'agents':
        return TruckIcon;
      case 'suppliers':
        return TruckIcon;
      case 'buyers':
        return ShoppingBagIcon;
      case 'support':
        return ShieldCheckIcon;
      case 'announcements':
        return MegaphoneIcon;
      default:
        return UsersIcon;
    }
  };

  const getRoomColor = (type: Room['type']) => {
    switch (type) {
      case 'general':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 'admin':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'agents':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'suppliers':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'buyers':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'support':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'announcements':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleRoomClick = (room: Room) => {
    if (room.canJoin) {
      onRoomSelect(room.id);
    }
  };

  const handleJoinRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementation would join the room
    console.log('Join room:', roomId);
  };

  const rooms = getAvailableRooms();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-1">
        {rooms.map((room) => {
          const Icon = getRoomIcon(room.type);
          const isActive = currentConversationId === room.id;
          const colorClasses = getRoomColor(room.type);

          return (
            <motion.div
              key={room.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleRoomClick(room)}
              className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20' 
                  : room.canJoin 
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700/30' 
                    : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Room Icon */}
                <div className={`p-2 rounded-lg ${colorClasses} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                  {room.isPrivate && (
                    <LockClosedIcon className="w-3 h-3 absolute -top-1 -right-1 text-gray-500" />
                  )}
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-medium truncate ${
                        isActive 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {room.name}
                      </h3>
                      
                      {room.isPrivate && (
                        <LockClosedIcon className="w-3 h-3 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Unread count */}
                      {room.unreadCount && room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1 font-medium">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}
                      
                      {/* Join button for non-joined rooms */}
                      {!room.isJoined && room.canJoin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleJoinRoom(room.id, e)}
                          className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          Join
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <p className={`text-xs truncate mt-1 ${
                    isActive 
                      ? 'text-blue-700 dark:text-blue-200' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {room.description}
                  </p>

                  {/* Member and activity info */}
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <div className="flex items-center space-x-3">
                      <span className={`${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-300' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {room.memberCount} members
                      </span>
                      
                      {room.onlineCount > 0 && (
                        <span className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className={`${
                            isActive 
                              ? 'text-blue-600 dark:text-blue-300' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {room.onlineCount} online
                          </span>
                        </span>
                      )}
                    </div>

                    {room.lastActivity && (
                      <span className={`${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-300' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {formatLastActivity(room.lastActivity)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Room creation hint for admins */}
      {userRole === 'admin' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create custom rooms for specific topics or departments
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              + Create New Room
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};
