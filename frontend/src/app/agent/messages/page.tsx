'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { ChatModal } from '@/components/agent/ChatModal';
import AgentLayout from '@/components/layout/AgentLayout';

interface ChatRoom {
  room_id: string;
  agent_id: string;
  supplier_id: string;
  material_id: string;
  assignment_id: string | null;
  status: string;
  created_at: string;
  last_message_at: string | null;
  supplier_name: string;
  material_title: string;
  unread_count: number;
}

export default function AgentMessagesPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (user?.asgardeoId || user?.sub) {
      fetchChatRooms();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchChatRooms, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchChatRooms = async () => {
    if (!user?.asgardeoId && !user?.sub) {
      console.log('No user ID found, waiting for auth...');
      return;
    }

    try {
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        console.error('Failed to get auth token:', authResponse.status);
        if (authResponse.status === 401) {
          setTimeout(() => {
            if (user?.asgardeoId || user?.sub) {
              fetchChatRooms();
            }
          }, 1000);
        }
        return;
      }

      const authData = await authResponse.json();
      const idToken = authData.idToken;
      const agentId = authData.user?.asgardeoId || authData.user?.sub || authData.userId;

      const response = await fetch(`/backend/chat/rooms/agent/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.rooms || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch chat rooms:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedRoom(null);
    fetchChatRooms(); // Refresh to update unread counts
  };

  return (
    <AgentLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View and respond to messages from suppliers about material assignments
          </p>
        </div>

        {authLoading || isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agent-DEFAULT"></div>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Messages with suppliers will appear here once you start conversations about material assignments.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {chatRooms.map((room) => (
              <div
                key={room.room_id}
                onClick={() => handleRoomClick(room)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {room.supplier_name}
                      </h3>
                      {room.unread_count > 0 && (
                        <span className="px-2.5 py-0.5 bg-agent-DEFAULT text-white text-xs font-medium rounded-full">
                          {room.unread_count} new
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Material: {room.material_title}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {room.last_message_at
                        ? `Last message: ${new Date(room.last_message_at).toLocaleString('en-LK', {
                            timeZone: 'Asia/Colombo',
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}`
                        : 'No messages yet'}
                    </p>
                  </div>
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {selectedRoom && showChatModal && (
          <ChatModal
            isOpen={showChatModal}
            onClose={handleCloseChat}
            assignment={{ 
              assignmentId: selectedRoom.assignment_id,
              materialId: selectedRoom.material_id,
              supplierId: selectedRoom.supplier_id
            }}
            supplierName={selectedRoom.supplier_name}
            supplierId={selectedRoom.supplier_id}
            materialTitle={selectedRoom.material_title}
            materialId={selectedRoom.material_id}
          />
        )}
      </div>
    </AgentLayout>
  );
}