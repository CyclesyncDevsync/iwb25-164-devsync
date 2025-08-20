import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'agent' | 'supplier' | 'buyer';
  content: string;
  type: 'text' | 'file' | 'voice' | 'location' | 'system';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileUrl?: string;
    voiceDuration?: number;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    replyTo?: string;
    flagged?: boolean;
    translated?: {
      from: string;
      to: string;
      text: string;
    };
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'room' | 'group';
  name: string;
  description?: string;
  participants: Participant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  lastActivity: string;
  isTyping?: string[];
  metadata?: {
    roomType?: 'general' | 'admin' | 'agents' | 'suppliers' | 'buyers' | 'support' | 'announcements';
    isPrivate?: boolean;
    permissions?: {
      canInvite: boolean;
      canRemove: boolean;
      canPost: boolean;
      canDeleteMessages: boolean;
    };
  };
}

export interface Participant {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'supplier' | 'buyer';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface VoiceMessage {
  id: string;
  blob: Blob;
  duration: number;
  isPlaying: boolean;
}

class ChatWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;
  private userRole: string | null = null;

  connect(userId: string, userRole: string, token: string) {
    this.userId = userId;
    this.userRole = userRole;

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
      auth: {
        token,
        userId,
        userRole,
      },
      transports: ['websocket'],
      upgrade: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnection();
    });

    // Join user-specific rooms based on role
    this.socket.on('connect', () => {
      if (this.userRole) {
        this.joinRoleBasedRooms(this.userRole);
      }
    });
  }

  private joinRoleBasedRooms(role: string) {
    const commonRooms = ['general', 'announcements'];
    const roleSpecificRooms: { [key: string]: string[] } = {
      admin: ['admin', 'support'],
      agent: ['agents', 'support'],
      supplier: ['suppliers'],
      buyer: ['buyers'],
    };

    const roomsToJoin = [...commonRooms, ...(roleSpecificRooms[role] || [])];
    
    roomsToJoin.forEach(room => {
      this.joinRoom(room);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.socket?.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  // Message Operations
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      const messageWithId = {
        ...message,
        id: `temp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'sending' as const,
      };

      this.socket.emit('send_message', messageWithId, (response: { success: boolean; message?: ChatMessage; error?: string }) => {
        if (response.success && response.message) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  editMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('edit_message', { messageId, newContent }, (response: { success: boolean; message?: ChatMessage; error?: string }) => {
        if (response.success && response.message) {
          resolve(response.message);
        } else {
          reject(new Error(response.error || 'Failed to edit message'));
        }
      });
    });
  }

  deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('delete_message', { messageId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to delete message'));
        }
      });
    });
  }

  flagMessage(messageId: string, reason: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('flag_message', { messageId, reason }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to flag message'));
        }
      });
    });
  }

  // Typing Indicators
  startTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // Room Operations
  joinRoom(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_room', { roomId });
  }

  createRoom(name: string, description: string, type: 'room' | 'group', isPrivate: boolean = false): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('create_room', { name, description, type, isPrivate }, (response: { success: boolean; conversation?: Conversation; error?: string }) => {
        if (response.success && response.conversation) {
          resolve(response.conversation);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  // File Operations
  uploadFile(file: File, conversationId: string): Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      // Convert file to base64 for socket transmission
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        this.socket!.emit('upload_file', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: base64Data,
          conversationId,
        }, (response: { success: boolean; fileUrl?: string; fileName?: string; fileSize?: number; fileType?: string; error?: string }) => {
          if (response.success && response.fileUrl) {
            resolve({
              fileUrl: response.fileUrl,
              fileName: response.fileName || file.name,
              fileSize: response.fileSize || file.size,
              fileType: response.fileType || file.type,
            });
          } else {
            reject(new Error(response.error || 'Failed to upload file'));
          }
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Translation
  translateMessage(messageId: string, targetLanguage: string): Promise<{ translatedText: string; sourceLanguage: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      this.socket.emit('translate_message', { messageId, targetLanguage }, (response: { success: boolean; translatedText?: string; sourceLanguage?: string; error?: string }) => {
        if (response.success && response.translatedText) {
          resolve({
            translatedText: response.translatedText,
            sourceLanguage: response.sourceLanguage || 'unknown',
          });
        } else {
          reject(new Error(response.error || 'Failed to translate message'));
        }
      });
    });
  }

  // Message Status
  markMessageAsRead(messageId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('mark_as_read', { messageId });
  }

  markConversationAsRead(conversationId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('mark_conversation_as_read', { conversationId });
  }

  // Event Listeners
  onNewMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageUpdated(callback: (message: ChatMessage) => void) {
    this.socket?.on('message_updated', callback);
  }

  onMessageDeleted(callback: (messageId: string) => void) {
    this.socket?.on('message_deleted', callback);
  }

  onTypingStatusChanged(callback: (status: TypingStatus) => void) {
    this.socket?.on('typing_status', callback);
  }

  onUserOnlineStatusChanged(callback: (userId: string, isOnline: boolean) => void) {
    this.socket?.on('user_online_status', callback);
  }

  onConversationUpdated(callback: (conversation: Conversation) => void) {
    this.socket?.on('conversation_updated', callback);
  }

  onFileUploadProgress(callback: (progress: { messageId: string; progress: number }) => void) {
    this.socket?.on('file_upload_progress', callback);
  }

  // Cleanup
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatWebSocketService = new ChatWebSocketService();
