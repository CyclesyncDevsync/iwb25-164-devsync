import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Material,
  SupplierProfile,
  SupplierAnalytics,
  MaterialRegistrationForm,
  MaterialStatus,
  SupplierType,
  Order,
  OrderStatus,
  SupplierSettings,
  NotificationSettings,
  SecuritySettings,
  BusinessSettings,
  ApiSettings
} from '../../types/supplier';

// Async thunks
export const fetchSupplierProfile = createAsyncThunk(
  'supplier/fetchProfile',
  async (supplierId: string) => {
    // API call to fetch supplier profile
    const response = await fetch(`/api/suppliers/${supplierId}`);
    return response.json();
  }
);

export const updateSupplierProfile = createAsyncThunk(
  'supplier/updateProfile',
  async (profileData: Partial<SupplierProfile>) => {
    const response = await fetch('/api/suppliers/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return response.json();
  }
);

export const fetchSupplierMaterials = createAsyncThunk(
  'supplier/fetchMaterials',
  async (params: { page: number; limit: number; status?: MaterialStatus }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.status && { status: params.status })
    });
    const response = await fetch(`/api/suppliers/materials?${searchParams}`);
    return response.json();
  }
);

export const createMaterial = createAsyncThunk(
  'supplier/createMaterial',
  async (materialData: MaterialRegistrationForm) => {
    const formData = new FormData();
    
    // Append basic material data
    Object.entries(materialData).forEach(([key, value]) => {
      if (key === 'photos') {
        (value as File[]).forEach((file, index) => {
          formData.append(`photos[${index}]`, file);
        });
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch('/api/suppliers/materials', {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
);

export const updateMaterial = createAsyncThunk(
  'supplier/updateMaterial',
  async ({ materialId, materialData }: { materialId: string; materialData: Partial<Material> }) => {
    const response = await fetch(`/api/suppliers/materials/${materialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData)
    });
    return response.json();
  }
);

export const deleteMaterial = createAsyncThunk(
  'supplier/deleteMaterial',
  async (materialId: string) => {
    await fetch(`/api/suppliers/materials/${materialId}`, {
      method: 'DELETE'
    });
    return materialId;
  }
);

export const fetchSupplierAnalytics = createAsyncThunk(
  'supplier/fetchAnalytics',
  async (timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    const response = await fetch(`/api/suppliers/analytics?timeRange=${timeRange}`);
    return response.json();
  }
);

// Order Management Async Thunks
export const fetchSupplierOrders = createAsyncThunk(
  'supplier/fetchOrders',
  async (params: { page: number; limit: number; status?: OrderStatus }) => {
    const searchParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.status && { status: params.status })
    });
    const response = await fetch(`/api/suppliers/orders?${searchParams}`);
    return response.json();
  }
);

export const updateOrderStatus = createAsyncThunk(
  'supplier/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    const response = await fetch(`/api/suppliers/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'supplier/fetchOrderDetails',
  async (orderId: string) => {
    const response = await fetch(`/api/suppliers/orders/${orderId}`);
    return response.json();
  }
);

// Settings async thunks
export const fetchSupplierSettings = createAsyncThunk(
  'supplier/fetchSupplierSettings',
  async () => {
    // Mock data for development
    return {
      id: '1',
      supplierId: 'SUP001',
      notifications: {
        email: {
          orderUpdates: true,
          paymentConfirmations: true,
          systemNotifications: true,
          marketingEmails: false
        },
        sms: {
          urgentAlerts: true,
          orderStatusUpdates: false,
          paymentReminders: true
        },
        push: {
          realTimeNotifications: true,
          dailySummary: true,
          weeklyReports: false
        }
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 60,
        loginAlerts: true,
        passwordExpiry: 90,
        allowedIpAddresses: []
      },
      business: {
        companyName: 'EcoRecycle Solutions',
        businessType: 'recycling',
        taxId: 'TX123456789',
        certifications: ['ISO 14001', 'R2 Certification'],
        operatingHours: {
          monday: { open: '08:00', close: '17:00', isClosed: false },
          tuesday: { open: '08:00', close: '17:00', isClosed: false },
          wednesday: { open: '08:00', close: '17:00', isClosed: false },
          thursday: { open: '08:00', close: '17:00', isClosed: false },
          friday: { open: '08:00', close: '17:00', isClosed: false },
          saturday: { open: '09:00', close: '14:00', isClosed: false },
          sunday: { open: '09:00', close: '14:00', isClosed: true }
        },
        autoAcceptOrders: false,
        minimumOrderValue: 100,
        preferredPaymentMethods: ['bank_transfer', 'check']
      },
      api: {
        webhookUrl: '',
        apiKey: 'sk_test_1234567890abcdef',
        rateLimit: 120,
        allowedOrigins: ['https://app.cyclesync.com'],
        enableLogging: true
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-08-19T15:30:00Z'
    };
  }
);

export const updateSupplierSettings = createAsyncThunk(
  'supplier/updateSupplierSettings',
  async (settings: SupplierSettings) => {
    const response = await fetch('/api/suppliers/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return response.json();
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'supplier/updateNotificationSettings',
  async (notifications: NotificationSettings) => {
    const response = await fetch('/api/suppliers/settings/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifications)
    });
    return response.json();
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'supplier/updateSecuritySettings',
  async (security: SecuritySettings) => {
    const response = await fetch('/api/suppliers/settings/security', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(security)
    });
    return response.json();
  }
);

export const updateBusinessSettings = createAsyncThunk(
  'supplier/updateBusinessSettings',
  async (business: BusinessSettings) => {
    const response = await fetch('/api/suppliers/settings/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(business)
    });
    return response.json();
  }
);

export const updateApiSettings = createAsyncThunk(
  'supplier/updateApiSettings',
  async (api: ApiSettings) => {
    const response = await fetch('/api/suppliers/settings/api', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(api)
    });
    return response.json();
  }
);

interface SupplierState {
  profile: SupplierProfile | null;
  materials: Material[];
  orders: Order[];
  settings: SupplierSettings | null;
  analytics: SupplierAnalytics | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  filters: {
    status: MaterialStatus | 'all';
    category: string | 'all';
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };
  loading: {
    profile: boolean;
    materials: boolean;
    orders: boolean;
    settings: boolean;
    analytics: boolean;
    creating: boolean;
    updating: boolean;
  };
  error: string | null;
  selectedMaterial: Material | null;
  drafts: MaterialRegistrationForm[];
}

const initialState: SupplierState = {
  profile: null,
  materials: [],
  orders: [],
  settings: null,
  analytics: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    limit: 10
  },
  filters: {
    status: 'all',
    category: 'all',
    dateRange: {
      start: null,
      end: null
    }
  },
  loading: {
    profile: false,
    materials: false,
    orders: false,
    settings: false,
    analytics: false,
    creating: false,
    updating: false
  },
  error: null,
  selectedMaterial: null,
  drafts: []
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedMaterial: (state, action: PayloadAction<Material | null>) => {
      state.selectedMaterial = action.payload;
    },
    saveDraft: (state, action: PayloadAction<MaterialRegistrationForm>) => {
      const existingIndex = state.drafts.findIndex(
        draft => draft.title === action.payload.title
      );
      if (existingIndex >= 0) {
        state.drafts[existingIndex] = action.payload;
      } else {
        state.drafts.push(action.payload);
      }
    },
    removeDraft: (state, action: PayloadAction<string>) => {
      state.drafts = state.drafts.filter(draft => draft.title !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    resetMaterials: (state) => {
      state.materials = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchSupplierProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(fetchSupplierProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
      })
      .addCase(fetchSupplierProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.error.message || 'Failed to fetch profile';
      });

    // Update Profile
    builder
      .addCase(updateSupplierProfile.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateSupplierProfile.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateSupplierProfile.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.error.message || 'Failed to update profile';
      });

    // Fetch Materials
    builder
      .addCase(fetchSupplierMaterials.pending, (state) => {
        state.loading.materials = true;
        state.error = null;
      })
      .addCase(fetchSupplierMaterials.fulfilled, (state, action) => {
        state.loading.materials = false;
        state.materials = action.payload.materials;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSupplierMaterials.rejected, (state, action) => {
        state.loading.materials = false;
        state.error = action.error.message || 'Failed to fetch materials';
      });

    // Create Material
    builder
      .addCase(createMaterial.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.materials.unshift(action.payload);
        // Remove from drafts if it exists
        state.drafts = state.drafts.filter(
          draft => draft.title !== action.payload.title
        );
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.error.message || 'Failed to create material';
      });

    // Update Material
    builder
      .addCase(updateMaterial.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading.updating = false;
        const index = state.materials.findIndex(m => m.id === action.payload.id);
        if (index >= 0) {
          state.materials[index] = action.payload;
        }
        if (state.selectedMaterial?.id === action.payload.id) {
          state.selectedMaterial = action.payload;
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.error.message || 'Failed to update material';
      });

    // Delete Material
    builder
      .addCase(deleteMaterial.pending, (state) => {
        state.loading.updating = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.materials = state.materials.filter(m => m.id !== action.payload);
        if (state.selectedMaterial?.id === action.payload) {
          state.selectedMaterial = null;
        }
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading.updating = false;
        state.error = action.error.message || 'Failed to delete material';
      });

    // Fetch Analytics
    builder
      .addCase(fetchSupplierAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error = null;
      })
      .addCase(fetchSupplierAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSupplierAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      })
      // Order management cases
      .addCase(fetchSupplierOrders.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(fetchSupplierOrders.fulfilled, (state, action) => {
        state.loading.orders = false;
        state.orders = action.payload;
      })
      .addCase(fetchSupplierOrders.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading.orders = false;
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.error.message || 'Failed to update order status';
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading.orders = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading.orders = false;
        const orderDetails = action.payload;
        const index = state.orders.findIndex(order => order.id === orderDetails.id);
        if (index !== -1) {
          state.orders[index] = orderDetails;
        } else {
          state.orders.push(orderDetails);
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading.orders = false;
        state.error = action.error.message || 'Failed to fetch order details';
      })
      // Settings management cases
      .addCase(fetchSupplierSettings.pending, (state) => {
        state.loading.settings = true;
        state.error = null;
      })
      .addCase(fetchSupplierSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
      })
      .addCase(fetchSupplierSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(updateSupplierSettings.pending, (state) => {
        state.loading.settings = true;
        state.error = null;
      })
      .addCase(updateSupplierSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
      })
      .addCase(updateSupplierSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.error.message || 'Failed to update settings';
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        if (state.settings) {
          state.settings.notifications = action.payload;
        }
      })
      .addCase(updateSecuritySettings.fulfilled, (state, action) => {
        if (state.settings) {
          state.settings.security = action.payload;
        }
      })
      .addCase(updateBusinessSettings.fulfilled, (state, action) => {
        if (state.settings) {
          state.settings.business = action.payload;
        }
      })
      .addCase(updateApiSettings.fulfilled, (state, action) => {
        if (state.settings) {
          state.settings.api = action.payload;
        }
      });
  }
});

export const {
  setFilters,
  setSelectedMaterial,
  saveDraft,
  removeDraft,
  clearError,
  resetMaterials
} = supplierSlice.actions;

export default supplierSlice.reducer;
