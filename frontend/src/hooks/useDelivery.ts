import { useState, useEffect, useCallback } from 'react';
import { DeliveryTracking, DeliveryStatus } from '../types/supplier';
import { deliveryService, UpdateDeliveryStatusRequest } from '../services/deliveryService';

export function useDelivery(orderId: string | null) {
  const [delivery, setDelivery] = useState<DeliveryTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDelivery = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await deliveryService.getDeliveryByOrderId(orderId);
      setDelivery(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery');
      console.error('Error fetching delivery:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const updateStatus = useCallback(
    async (status: DeliveryStatus, location: string, description: string, updatedBy: string = 'supplier') => {
      if (!orderId) return;

      setLoading(true);
      setError(null);

      try {
        const request: UpdateDeliveryStatusRequest = {
          status,
          location,
          description,
          updatedBy,
        };

        const updatedDelivery = await deliveryService.updateDeliveryStatus(orderId, request);
        setDelivery(updatedDelivery);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update delivery status');
        console.error('Error updating delivery:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  return {
    delivery,
    loading,
    error,
    refetch: fetchDelivery,
    updateStatus,
  };
}

export function useSupplierDeliveries(supplierId: string | null) {
  const [deliveries, setDeliveries] = useState<DeliveryTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    if (!supplierId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await deliveryService.getSupplierDeliveries(supplierId);
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries');
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  return {
    deliveries,
    loading,
    error,
    refetch: fetchDeliveries,
  };
}
