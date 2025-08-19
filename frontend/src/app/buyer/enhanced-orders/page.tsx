'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CameraIcon,
  PhoneIcon,
  StarIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ArrowPathIcon,
  EyeIcon,
  PrinterIcon,
  ShareIcon,
  BellIcon,
  ShieldCheckIcon,
  CubeIcon,
  BuildingOfficeIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BuyerLayout, AdvancedPurchaseManagement } from '@/components/buyer';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  title: string;
  supplier: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    isVerified: boolean;
    location: string;
    phone: string;
    email: string;
  };
  status: 'processing' | 'confirmed' | 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  orderDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  amount: number;
  quantity: number;
  unit: string;
  images: string[];
  category: string;
  specifications: Record<string, any>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: [number, number];
  };
  tracking: {
    trackingId: string;
    courier: string;
    updates: Array<{
      id: string;
      timestamp: number;
      status: string;
      location: string;
      description: string;
      agent?: {
        name: string;
        phone: string;
        photo?: string;
      };
      photos?: string[];
      signature?: string;
      coordinates?: [number, number];
    }>;
    estimatedTime: number;
    deliveryType: 'standard' | 'express' | 'same_day';
  };
  payment: {
    method: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId: string;
    breakdown: {
      subtotal: number;
      shipping: number;
      tax: number;
      total: number;
    };
  };
  documents: {
    invoice?: string;
    receipt?: string;
    qualityCertificate?: string;
    deliveryProof?: string;
  };
  canCancel: boolean;
  canReturn: boolean;
  canDispute: boolean;
  canRate: boolean;
}

const EnhancedOrdersPage = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  // Mock orders data
  useEffect(() => {
    const mockOrders: PurchaseOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        title: 'Recycled Steel Beams - Premium Grade',
        supplier: {
          id: 'sup1',
          name: 'GreenBuild Materials',
          rating: 4.8,
          isVerified: true,
          location: 'Mumbai, Maharashtra',
          phone: '+91 98765 43210',
          email: 'contact@greenbuild.com'
        },
        status: 'in_transit',
        orderDate: '2024-02-10T10:30:00Z',
        estimatedDelivery: '2024-02-15T16:00:00Z',
        amount: 75000,
        quantity: 5,
        unit: 'tons',
        images: ['/api/placeholder/400/300'],
        category: 'Construction Materials',
        specifications: {
          grade: 'Grade 50',
          length: '6-12 meters',
          weight: '45-60 kg/m',
          coating: 'Galvanized',
          certification: 'ISI Certified'
        },
        deliveryAddress: {
          street: '123 Industrial Area, Sector 5',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          coordinates: [18.5204, 73.8567]
        },
        tracking: {
          trackingId: 'TRK789123456',
          courier: 'BlueSpeed Logistics',
          estimatedTime: 1440, // 24 hours
          deliveryType: 'standard',
          updates: [
            {
              id: 'upd1',
              timestamp: Date.now() - 3600000,
              status: 'In Transit',
              location: 'Nashik, Maharashtra',
              description: 'Package is on the way to destination city',
              agent: {
                name: 'Rajesh Kumar',
                phone: '+91 98765 00001'
              }
            },
            {
              id: 'upd2',
              timestamp: Date.now() - 7200000,
              status: 'Dispatched',
              location: 'Mumbai Hub',
              description: 'Package has been dispatched from origin facility'
            },
            {
              id: 'upd3',
              timestamp: Date.now() - 14400000,
              status: 'Picked Up',
              location: 'Supplier Warehouse',
              description: 'Package picked up from supplier'
            }
          ]
        },
        payment: {
          method: 'Bank Transfer',
          status: 'paid',
          transactionId: 'TXN2024001',
          breakdown: {
            subtotal: 70000,
            shipping: 3000,
            tax: 2000,
            total: 75000
          }
        },
        documents: {
          invoice: 'INV-2024-001.pdf',
          receipt: 'RCP-2024-001.pdf',
          qualityCertificate: 'QC-2024-001.pdf'
        },
        canCancel: false,
        canReturn: false,
        canDispute: true,
        canRate: false
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        title: 'Reclaimed Teak Wood Planks',
        supplier: {
          id: 'sup2',
          name: 'Heritage Wood Co.',
          rating: 4.6,
          isVerified: true,
          location: 'Bangalore, Karnataka',
          phone: '+91 98765 43211',
          email: 'sales@heritagewood.com'
        },
        status: 'delivered',
        orderDate: '2024-02-08T14:20:00Z',
        estimatedDelivery: '2024-02-12T10:00:00Z',
        actualDelivery: '2024-02-12T09:30:00Z',
        amount: 45000,
        quantity: 10,
        unit: 'cubic meters',
        images: ['/api/placeholder/400/300'],
        category: 'Wood Materials',
        specifications: {
          species: 'Teak',
          dimensions: '2m x 15cm x 5cm',
          moisture: '12-15%',
          treatment: 'Seasoned',
          grade: 'Premium'
        },
        deliveryAddress: {
          street: '456 Furniture District',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          coordinates: [12.9716, 77.5946]
        },
        tracking: {
          trackingId: 'TRK789123457',
          courier: 'Local Express',
          estimatedTime: 0,
          deliveryType: 'express',
          updates: [
            {
              id: 'upd4',
              timestamp: Date.now() - 86400000,
              status: 'Delivered',
              location: 'Destination',
              description: 'Package delivered successfully to recipient',
              agent: {
                name: 'Suresh Reddy',
                phone: '+91 98765 00002'
              }
            },
            {
              id: 'upd5',
              timestamp: Date.now() - 90000000,
              status: 'Out for Delivery',
              location: 'Bangalore Hub',
              description: 'Package is out for delivery'
            }
          ]
        },
        payment: {
          method: 'Credit Card',
          status: 'paid',
          transactionId: 'TXN2024002',
          breakdown: {
            subtotal: 42000,
            shipping: 2000,
            tax: 1000,
            total: 45000
          }
        },
        documents: {
          invoice: 'INV-2024-002.pdf',
          receipt: 'RCP-2024-002.pdf',
          qualityCertificate: 'QC-2024-002.pdf',
          deliveryProof: 'DEL-2024-002.pdf'
        },
        canCancel: false,
        canReturn: true,
        canDispute: false,
        canRate: true
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        title: 'Recycled Plastic Lumber',
        supplier: {
          id: 'sup3',
          name: 'PlastiWood Industries',
          rating: 4.7,
          isVerified: true,
          location: 'Chennai, Tamil Nadu',
          phone: '+91 98765 43212',
          email: 'info@plastiwood.com'
        },
        status: 'processing',
        orderDate: '2024-02-12T16:45:00Z',
        estimatedDelivery: '2024-02-18T14:00:00Z',
        amount: 28000,
        quantity: 100,
        unit: 'pieces',
        images: ['/api/placeholder/400/300'],
        category: 'Plastic Materials',
        specifications: {
          material: '100% Recycled HDPE',
          dimensions: '5cm x 10cm x 3m',
          density: '0.95 g/cm³',
          color: 'Brown',
          uvResistance: 'UV Stabilized'
        },
        deliveryAddress: {
          street: '789 Construction Site',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          coordinates: [13.0827, 80.2707]
        },
        tracking: {
          trackingId: 'TRK789123458',
          courier: 'FastTrack Logistics',
          estimatedTime: 4320, // 72 hours
          deliveryType: 'standard',
          updates: [
            {
              id: 'upd6',
              timestamp: Date.now() - 1800000,
              status: 'Order Confirmed',
              location: 'Chennai Facility',
              description: 'Order has been confirmed and is being prepared'
            }
          ]
        },
        payment: {
          method: 'UPI',
          status: 'paid',
          transactionId: 'TXN2024003',
          breakdown: {
            subtotal: 26000,
            shipping: 1500,
            tax: 500,
            total: 28000
          }
        },
        documents: {
          invoice: 'INV-2024-003.pdf',
          receipt: 'RCP-2024-003.pdf'
        },
        canCancel: true,
        canReturn: false,
        canDispute: false,
        canRate: false
      }
    ];

    setOrders(mockOrders);
  }, []);

  const handleCancelOrder = async (orderId: string, reason: string) => {
    console.log('Cancelling order:', orderId, reason);
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' as any, canCancel: false }
        : order
    ));
    return true;
  };

  const handleInitiateReturn = async (orderId: string, reason: string, items: string[]) => {
    console.log('Initiating return:', orderId, reason, items);
    return true;
  };

  const handleRaiseDispute = async (orderId: string, category: string, description: string) => {
    console.log('Raising dispute:', orderId, category, description);
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'disputed' as any }
        : order
    ));
    return true;
  };

  const handleRateOrder = async (orderId: string, rating: number, review: string) => {
    console.log('Rating order:', orderId, rating, review);
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'completed' as any, canRate: false }
        : order
    ));
    return true;
  };

  const handleContactSupplier = (supplierId: string, message: string) => {
    console.log('Contacting supplier:', supplierId, message);
  };

  const handleTrackDelivery = (trackingId: string) => {
    console.log('Tracking delivery:', trackingId);
  };

  const handleScheduleDelivery = async (orderId: string, timeSlot: string) => {
    console.log('Scheduling delivery:', orderId, timeSlot);
    return true;
  };

  const handleRequestQualityCheck = async (orderId: string) => {
    console.log('Requesting quality check:', orderId);
    return true;
  };

  return (
    <BuyerLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Purchase Management</h1>
          <p className="text-gray-600">Advanced order tracking, management, and customer service tools</p>
        </div>

        {/* Enhanced Purchase Management Component */}
        <AdvancedPurchaseManagement
          orders={orders}
          onCancelOrder={handleCancelOrder}
          onInitiateReturn={handleInitiateReturn}
          onRaiseDispute={handleRaiseDispute}
          onRateOrder={handleRateOrder}
          onContactSupplier={handleContactSupplier}
          onTrackDelivery={handleTrackDelivery}
          onScheduleDelivery={handleScheduleDelivery}
          onRequestQualityCheck={handleRequestQualityCheck}
        />
      </div>
    </BuyerLayout>
  );
};

export default EnhancedOrdersPage;
