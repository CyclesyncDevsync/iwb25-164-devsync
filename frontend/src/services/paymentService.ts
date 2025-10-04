import axios from 'axios';

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'http://localhost:8098';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  created: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      country?: string;
      postal_code?: string;
    };
  };
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface StripeCustomer {
  id: string;
  name: string;
  email: string;
  address?: Record<string, any>;
  metadata?: Record<string, any>;
  created: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    country?: string;
    postal_code?: string;
  };
}

class PaymentService {
  private async getAuthHeaders() {
    // Get auth token from cookie (similar to other API services)
    return {
      'Content-Type': 'application/json',
    };
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const response = await axios.post(
        '/api/payment/create-intent',
        data,
        {
          headers: await this.getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create payment intent');
      }
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create payment intent'
      );
    }
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<void> {
    try {
      const response = await axios.post(
        '/api/payment/confirm-payment',
        data,
        {
          headers: await this.getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('Confirm payment error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to confirm payment'
      );
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await axios.get(
        `/api/payment/intent/${paymentIntentId}`,
        {
          headers: await this.getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get payment intent');
      }
    } catch (error: any) {
      console.error('Get payment intent error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get payment intent'
      );
    }
  }

  async createCustomer(data: CreateCustomerRequest): Promise<StripeCustomer> {
    try {
      const response = await axios.post(
        '/api/payment/customer',
        data,
        {
          headers: await this.getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create customer');
      }
    } catch (error: any) {
      console.error('Create customer error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create customer'
      );
    }
  }
}

export const paymentService = new PaymentService();