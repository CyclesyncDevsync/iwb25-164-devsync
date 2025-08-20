import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, Conversation, Participant, TypingStatus, VoiceMessage } from '../../services/chatWebSocket';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: { [conversationId: string]: ChatMessage[] };
  participants: { [conversationId: string]: Participant[] };
  typingStatuses: TypingStatus[];
  unreadCounts: { [conversationId: string]: number };
  searchQuery: string;
  filteredConversations: Conversation[];
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  voiceMessages: { [messageId: string]: VoiceMessage };
  selectedLanguage: string;
  autoTranslate: boolean;
  quickResponses: string[];
  flaggedMessages: string[];
  archivedConversations: string[];
  chatSettings: {
    soundNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    showTypingIndicators: boolean;
    showReadReceipts: boolean;
    autoDownloadFiles: boolean;
    maxFileSize: number;
  };
  uploadProgress: { [messageId: string]: number };
  error: string | null;
  loading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  messages: {},
  participants: {},
  typingStatuses: [],
  unreadCounts: {},
  searchQuery: '',
  filteredConversations: [],
  isConnected: false,
  connectionStatus: 'disconnected',
  voiceMessages: {},
  selectedLanguage: 'en',
  autoTranslate: false,
  quickResponses: [
    'Hello! How can I help you?',
    'Thank you for your message.',
    'I\'ll follow up with you shortly.',
    'This issue has been resolved.',
    'Please provide more details.',
    'I\'m currently reviewing your request.',
  ],
  flaggedMessages: [],
  archivedConversations: [],
  chatSettings: {
    soundNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    theme: 'system',
    fontSize: 'medium',
    showTypingIndicators: true,
    showReadReceipts: true,
    autoDownloadFiles: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  uploadProgress: {},
  error: null,
  loading: false,
};

// Async thunks for API calls
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page = 1, limit = 50 }: { conversationId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return { conversationId, messages: data.messages, hasMore: data.hasMore };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const searchConversations = createAsyncThunk(
  'chat/searchConversations',
  async (query: string, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search conversations');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Connection Management
    setConnectionStatus: (state, action: PayloadAction<'connecting' | 'connected' | 'disconnected' | 'error'>) => {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },

    // Conversation Management
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex((c: Conversation) => c.id === action.payload.id);
      if (existingIndex >= 0) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },

    updateConversation: (state, action: PayloadAction<Partial<Conversation> & { id: string }>) => {
      const index = state.conversations.findIndex((c: Conversation) => c.id === action.payload.id);
      if (index >= 0) {
        state.conversations[index] = { ...state.conversations[index], ...action.payload };
      }
    },

    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
      if (action.payload) {
        // Mark conversation as read when opened
        state.unreadCounts[action.payload] = 0;
      }
    },

    archiveConversation: (state, action: PayloadAction<string>) => {
      if (!state.archivedConversations.includes(action.payload)) {
        state.archivedConversations.push(action.payload);
      }
    },

    unarchiveConversation: (state, action: PayloadAction<string>) => {
      state.archivedConversations = state.archivedConversations.filter(id => id !== action.payload);
    },

    // Message Management
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if message already exists (prevent duplicates)
      const existingIndex = state.messages[conversationId].findIndex((m: ChatMessage) => m.id === action.payload.id);
      if (existingIndex >= 0) {
        state.messages[conversationId][existingIndex] = action.payload;
      } else {
        state.messages[conversationId].push(action.payload);
        
        // Update unread count if not current conversation
        if (state.currentConversationId !== conversationId) {
          state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
        }
        
        // Update conversation's last message
        const conversation = state.conversations.find((c: Conversation) => c.id === conversationId);
        if (conversation) {
          conversation.lastMessage = action.payload;
          conversation.lastActivity = action.payload.timestamp;
        }
      }
    },

    updateMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { conversationId, id } = action.payload;
      if (state.messages[conversationId]) {
        const index = state.messages[conversationId].findIndex((m: ChatMessage) => m.id === id);
        if (index >= 0) {
          state.messages[conversationId][index] = action.payload;
        }
      }
    },

    deleteMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].filter((m: ChatMessage) => m.id !== messageId);
      }
    },

    markMessageAsRead: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const { conversationId, messageId } = action.payload;
      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find((m: ChatMessage) => m.id === messageId);
        if (message) {
          message.status = 'read';
        }
      }
    },

    flagMessage: (state, action: PayloadAction<string>) => {
      if (!state.flaggedMessages.includes(action.payload)) {
        state.flaggedMessages.push(action.payload);
      }
    },

    unflagMessage: (state, action: PayloadAction<string>) => {
      state.flaggedMessages = state.flaggedMessages.filter(id => id !== action.payload);
    },

    // Typing Management
    updateTypingStatus: (state, action: PayloadAction<TypingStatus>) => {
      const existingIndex = state.typingStatuses.findIndex(
        (t: TypingStatus) => t.conversationId === action.payload.conversationId && t.userId === action.payload.userId
      );
      
      if (action.payload.isTyping) {
        if (existingIndex >= 0) {
          state.typingStatuses[existingIndex] = action.payload;
        } else {
          state.typingStatuses.push(action.payload);
        }
      } else {
        if (existingIndex >= 0) {
          state.typingStatuses.splice(existingIndex, 1);
        }
      }
    },

    clearTypingStatus: (state, action: PayloadAction<string>) => {
      state.typingStatuses = state.typingStatuses.filter((t: TypingStatus) => t.conversationId !== action.payload);
    },

    // Voice Message Management
    addVoiceMessage: (state, action: PayloadAction<VoiceMessage>) => {
      state.voiceMessages[action.payload.id] = action.payload;
    },

    updateVoiceMessage: (state, action: PayloadAction<Partial<VoiceMessage> & { id: string }>) => {
      if (state.voiceMessages[action.payload.id]) {
        state.voiceMessages[action.payload.id] = { ...state.voiceMessages[action.payload.id], ...action.payload };
      }
    },

    removeVoiceMessage: (state, action: PayloadAction<string>) => {
      delete state.voiceMessages[action.payload];
    },

    // Search and Filtering
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      
      // Filter conversations based on search query
      if (action.payload.trim() === '') {
        state.filteredConversations = state.conversations;
      } else {
        const query = action.payload.toLowerCase();
        state.filteredConversations = state.conversations.filter((conversation: Conversation) =>
          conversation.name.toLowerCase().includes(query) ||
          conversation.description?.toLowerCase().includes(query) ||
          conversation.lastMessage?.content.toLowerCase().includes(query)
        );
      }
    },

    // Language and Translation
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },

    setAutoTranslate: (state, action: PayloadAction<boolean>) => {
      state.autoTranslate = action.payload;
    },

    // Quick Responses
    addQuickResponse: (state, action: PayloadAction<string>) => {
      if (!state.quickResponses.includes(action.payload)) {
        state.quickResponses.push(action.payload);
      }
    },

    removeQuickResponse: (state, action: PayloadAction<string>) => {
      state.quickResponses = state.quickResponses.filter(response => response !== action.payload);
    },

    updateQuickResponses: (state, action: PayloadAction<string[]>) => {
      state.quickResponses = action.payload;
    },

    // Settings Management
    updateChatSettings: (state, action: PayloadAction<Partial<ChatState['chatSettings']>>) => {
      state.chatSettings = { ...state.chatSettings, ...action.payload };
    },

    // Upload Progress
    setUploadProgress: (state, action: PayloadAction<{ messageId: string; progress: number }>) => {
      state.uploadProgress[action.payload.messageId] = action.payload.progress;
    },

    removeUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },

    // Error Handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Loading State
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Reset State
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.filteredConversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        
        // Prepend messages for pagination (older messages)
        state.messages[conversationId] = [...messages, ...state.messages[conversationId]];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Search Conversations
      .addCase(searchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredConversations = action.payload;
      })
      .addCase(searchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setConnectionStatus,
  addConversation,
  updateConversation,
  setCurrentConversation,
  archiveConversation,
  unarchiveConversation,
  addMessage,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  flagMessage,
  unflagMessage,
  updateTypingStatus,
  clearTypingStatus,
  addVoiceMessage,
  updateVoiceMessage,
  removeVoiceMessage,
  setSearchQuery,
  setSelectedLanguage,
  setAutoTranslate,
  addQuickResponse,
  removeQuickResponse,
  updateQuickResponses,
  updateChatSettings,
  setUploadProgress,
  removeUploadProgress,
  setError,
  clearError,
  setLoading,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
