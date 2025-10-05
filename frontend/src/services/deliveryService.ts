import { DeliveryTracking, DeliveryStatus } from '../types/supplier';

const API_BASE_URL = process.env.NEXT_PUBLIC_DELIVERY_API_URL || 'http://localhost:9091';

export interface CreateDeliveryRequest {
  orderId: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export interface UpdateDeliveryStatusRequest {
  status: DeliveryStatus;
  location: string;
  description: string;
  updatedBy: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

class DeliveryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/delivery`;
  }

  async createDelivery(request: CreateDeliveryRequest): Promise<DeliveryTracking> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create delivery');
    }

    const data = await response.json();
    return this.transformDeliveryData(data);
  }

  async getDeliveryByOrderId(orderId: string): Promise<DeliveryTracking | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch delivery');
      }

      const data = await response.json();
      return this.transformDeliveryData(data);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      return null;
    }
  }

  async updateDeliveryStatus(
    orderId: string,
    request: UpdateDeliveryStatusRequest
  ): Promise<DeliveryTracking> {
    // Ensure all optional fields are explicitly included (Ballerina requirement)
    const payload = {
      status: request.status,
      location: request.location,
      description: request.description,
      updatedBy: request.updatedBy,
      latitude: request.latitude ?? null,
      longitude: request.longitude ?? null,
      notes: request.notes ?? null,
    };

    const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update delivery status');
    }

    const data = await response.json();
    return this.transformDeliveryData(data);
  }

  async getSupplierDeliveries(supplierId: string): Promise<DeliveryTracking[]> {
    const response = await fetch(`${this.baseUrl}/supplier/${supplierId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supplier deliveries');
    }

    const data = await response.json();
    return data.map((delivery: any) => this.transformDeliveryData(delivery));
  }

  async checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  private transformDeliveryData(data: any): DeliveryTracking {
    // Helper function to convert Ballerina time tuple [seconds, nanoseconds] to Date
    const convertBallerinaTime = (timeData: any): Date | undefined => {
      if (!timeData) return undefined;
      if (Array.isArray(timeData) && timeData.length === 2) {
        // Ballerina time tuple: [seconds, nanoseconds]
        const milliseconds = timeData[0] * 1000 + timeData[1] / 1000000;
        return new Date(milliseconds);
      }
      // Fallback for standard timestamp
      return new Date(timeData);
    };

    return {
      id: data.id,
      orderId: data.orderId,
      status: data.status as DeliveryStatus,
      currentLocation: data.currentLocation,
      estimatedDeliveryDate: convertBallerinaTime(data.estimatedDeliveryDate),
      actualDeliveryDate: convertBallerinaTime(data.actualDeliveryDate),
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      vehicleNumber: data.vehicleNumber,
      notes: data.notes,
      updates: data.updates.map((update: any) => ({
        id: update.id,
        deliveryId: update.deliveryId,
        status: update.status as DeliveryStatus,
        location: update.location,
        timestamp: convertBallerinaTime(update.timestamp) || new Date(),
        description: update.description,
        updatedBy: update.updatedBy,
        latitude: update.latitude,
        longitude: update.longitude,
      })),
      createdAt: convertBallerinaTime(data.createdAt) || new Date(),
      updatedAt: convertBallerinaTime(data.updatedAt) || new Date(),
    };
  }
}

export const deliveryService = new DeliveryService();
