'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../../hooks/redux';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  Material,
  MaterialCategory
} from '../../types/supplier';
import { createPickupAppointmentFromOrder, createCalendarAppointment } from '../../services/calendarService';

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState<string | null>(null);

  const addPickupToCalendar = async (order: Order) => {
    setCalendarLoading(order.id);
    try {
      console.log('Creating calendar appointment for order:', order);
      const calendarAppointment = createPickupAppointmentFromOrder(order);
      console.log('Calendar appointment payload:', calendarAppointment);

      const response = await createCalendarAppointment(calendarAppointment);
      console.log('Calendar API response:', response);

      if (response.status === 'success') {
        alert(`✅ Pickup appointment added to your calendar!\nAppointment ID: ${response.appointmentId}`);
      } else {
        alert(`Failed to add to calendar: ${response.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error adding to calendar:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error adding to calendar:\n${errorMessage}\n\nCheck browser console for details.`);
    } finally {
      setCalendarLoading(null);
    }
  };

  // supplier state available via store if needed (selector can be re-added when used)
  useAppSelector(state => state.supplier);

  // Mock orders data - replace with actual API calls
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      materialId: 'mat-1',
      material: {
        id: 'mat-1',
        title: 'High-Quality Aluminum Sheets',
        category: MaterialCategory.METAL,
        photos: [{ id: '1', url: '/api/placeholder/100/100', filename: 'aluminum.jpg', size: 1024, mimeType: 'image/jpeg', isMain: true, uploadedAt: new Date() }]
      } as unknown as Material,
      buyerId: 'buyer-1',
      buyerName: 'ABC Manufacturing Ltd',
      buyerEmail: 'procurement@abcmfg.com',
      buyerPhone: '+94 77 123 4567',
      quantity: 500,
      unitPrice: 250,
      totalAmount: 125000,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Bank Transfer',
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-08-16'),
      expectedPickupDate: new Date('2024-08-20'),
      pickupLocation: {
        address: '123 Industrial Road, Colombo 01',
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western'
      },
      specialInstructions: 'Please ensure materials are properly sorted and clean',
      agentId: 'agent-1',
      agentName: 'John Silva',
      trackingNumber: 'TRK-2024-001',
      documents: [],
      timeline: [
        {
          id: '1',
          status: OrderStatus.PENDING,
          timestamp: new Date('2024-08-15T10:00:00'),
          description: 'Order placed by buyer',
          updatedBy: 'System'
        },
        {
          id: '2',
          status: OrderStatus.CONFIRMED,
          timestamp: new Date('2024-08-15T11:30:00'),
          description: 'Order confirmed by supplier',
          updatedBy: 'Supplier'
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      materialId: 'mat-2',
      material: {
        id: 'mat-2',
        title: 'PET Plastic Bottles',
        category: MaterialCategory.PLASTIC,
        photos: [{ id: '2', url: '/api/placeholder/100/100', filename: 'plastic.jpg', size: 1024, mimeType: 'image/jpeg', isMain: true, uploadedAt: new Date() }]
      } as unknown as Material,
      buyerId: 'buyer-2',
      buyerName: 'Green Recycling Co.',
      buyerEmail: 'orders@greenrecycling.lk',
      buyerPhone: '+94 77 987 6543',
      quantity: 1000,
      unitPrice: 15,
      totalAmount: 15000,
      status: OrderStatus.READY_FOR_PICKUP,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date('2024-08-14'),
      updatedAt: new Date('2024-08-17'),
      expectedPickupDate: new Date('2024-08-19'),
      pickupLocation: {
        address: '456 Industrial Zone, Gampaha',
        city: 'Gampaha',
        district: 'Gampaha',
        province: 'Western'
      },
      documents: [],
      timeline: [
        {
          id: '3',
          status: OrderStatus.PENDING,
          timestamp: new Date('2024-08-14T09:00:00'),
          description: 'Order placed by buyer',
          updatedBy: 'System'
        },
        {
          id: '4',
          status: OrderStatus.CONFIRMED,
          timestamp: new Date('2024-08-14T10:15:00'),
          description: 'Order confirmed by supplier',
          updatedBy: 'Supplier'
        },
        {
          id: '5',
          status: OrderStatus.PREPARING,
          timestamp: new Date('2024-08-16T08:00:00'),
          description: 'Materials being prepared for pickup',
          updatedBy: 'Supplier'
        },
        {
          id: '6',
          status: OrderStatus.READY_FOR_PICKUP,
          timestamp: new Date('2024-08-17T14:00:00'),
          description: 'Materials ready for collection',
          updatedBy: 'Supplier'
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      materialId: 'mat-3',
      material: {
        id: 'mat-3',
        title: 'Cardboard Boxes',
        category: MaterialCategory.PAPER,
        photos: [{ id: '3', url: '/api/placeholder/100/100', filename: 'cardboard.jpg', size: 1024, mimeType: 'image/jpeg', isMain: true, uploadedAt: new Date() }]
      } as unknown as Material,
      buyerId: 'buyer-3',
      buyerName: 'EcoPackaging Solutions',
      buyerEmail: 'purchase@ecopack.lk',
      buyerPhone: '+94 77 555 7777',
      quantity: 200,
      unitPrice: 45,
      totalAmount: 9000,
      status: OrderStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'Digital Wallet',
      createdAt: new Date('2024-08-10'),
      updatedAt: new Date('2024-08-13'),
      expectedPickupDate: new Date('2024-08-12'),
      actualPickupDate: new Date('2024-08-12'),
      pickupLocation: {
        address: '789 Export Processing Zone, Katunayake',
        city: 'Katunayake',
        district: 'Gampaha',
        province: 'Western'
      },
      documents: [],
      timeline: [
        {
          id: '7',
          status: OrderStatus.PENDING,
          timestamp: new Date('2024-08-10T11:00:00'),
          description: 'Order placed by buyer',
          updatedBy: 'System'
        },
        {
          id: '8',
          status: OrderStatus.COMPLETED,
          timestamp: new Date('2024-08-13T16:00:00'),
          description: 'Order completed successfully',
          updatedBy: 'System'
        }
      ],
      rating: {
        id: '1',
        rating: 5,
        comment: 'Excellent quality materials and prompt service!',
        ratedAt: new Date('2024-08-13'),
        ratedBy: 'buyer'
      }
    }
  ]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.material.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case OrderStatus.IN_TRANSIT:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case OrderStatus.DISPUTED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'text-green-600 dark:text-green-400';
      case PaymentStatus.PENDING:
        return 'text-yellow-600 dark:text-yellow-400';
      case PaymentStatus.FAILED:
        return 'text-red-600 dark:text-red-400';
      case PaymentStatus.REFUNDED:
        return 'text-blue-600 dark:text-blue-400';
      case PaymentStatus.PARTIAL:
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return ClockIcon;
      case OrderStatus.CONFIRMED:
        return CheckCircleIcon;
      case OrderStatus.PREPARING:
        return ShoppingBagIcon;
      case OrderStatus.READY_FOR_PICKUP:
        return CheckCircleIcon;
      case OrderStatus.IN_TRANSIT:
        return TruckIcon;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return CheckCircleIcon;
      case OrderStatus.CANCELLED:
        return XCircleIcon;
      case OrderStatus.DISPUTED:
        return ExclamationTriangleIcon;
      default:
        return ShoppingBagIcon;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // API call to update order status
    console.log('Updating order status:', orderId, newStatus);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and track your material orders
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-emerald-50 to-white dark:from-emerald-900/10 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-amber-50 to-white dark:from-amber-900/10 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === OrderStatus.PENDING).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-emerald-50 to-white dark:from-emerald-900/10 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === OrderStatus.COMPLETED).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-green-50 to-white dark:from-green-900/10 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                LKR {orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, buyer, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 w-full rounded-lg border border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full h-12 rounded-lg border border-gray-200 shadow-sm px-3 py-3 focus:border-emerald-500 focus:ring-emerald-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Statuses</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Status
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
              className="w-full h-12 rounded-lg border border-gray-200 shadow-sm px-3 py-3 focus:border-emerald-500 focus:ring-emerald-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Payments</option>
              {Object.values(PaymentStatus).map(status => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full inline-flex items-center justify-center h-12 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="max-w-full">
          <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700">
              <tr>
                <th style={{ width: '14%' }} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order Details
                </th>
                <th style={{ width: '18%' }} className="pl-6 pr-8 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Buyer
                </th>
                <th style={{ width: '26%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Material
                </th>
                <th style={{ width: '14%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th style={{ width: '10%' }} className="px-6 py-3 pr-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th style={{ width: '8%' }} className="pl-4 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="pl-6 pr-6 py-3 align-top break-words">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="pl-6 pr-8 py-3 align-top break-words">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-none">
                          {/* Buyer avatar - use initials fallback */}
                          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                            {getInitials(order.buyerName)}
                          </div>
                        </div>
                        <div className="ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.buyerName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.buyerEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-3 align-top break-words">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-none">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={order.material.photos[0]?.url || '/api/placeholder/40/40'}
                            alt={order.material.title}
                          />
                        </div>
                        <div className="ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.material.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {order.quantity}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-3 align-top break-words">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        LKR {order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @ LKR {order.unitPrice}/unit
                      </div>
                    </td>
                    
                    <td className="px-6 py-3 align-top break-words">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-3 pr-4 align-top break-words">
                      <span className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="pl-4 px-6 py-3 align-top break-words text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.READY_FOR_PICKUP) && (
                          <button
                            onClick={() => addPickupToCalendar(order)}
                            disabled={calendarLoading === order.id}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                            title="Add Pickup to Calendar"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 p-6 bg-white dark:bg-gray-800 rounded-b-lg">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Orders will appear here once buyers place them.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

function OrderDetailsModal({ order, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'documents'>('details');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case OrderStatus.PREPARING:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case OrderStatus.READY_FOR_PICKUP:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case OrderStatus.IN_TRANSIT:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case OrderStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case OrderStatus.DISPUTED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Order Details - {order.orderNumber}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Placed on {order.createdAt.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Status and Actions */}
          <div className="mt-4 flex items-center justify-between">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            
            <div className="flex space-x-2">
              {order.status === OrderStatus.PENDING && (
                <>
                  <button
                    onClick={() => onUpdateStatus(order.id, OrderStatus.CONFIRMED)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                  >
                    Confirm Order
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, OrderStatus.CANCELLED)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Decline
                  </button>
                </>
              )}
              
              {order.status === OrderStatus.CONFIRMED && (
                <button
                  onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Start Preparing
                </button>
              )}
              
              {order.status === OrderStatus.PREPARING && (
                <button
                  onClick={() => onUpdateStatus(order.id, OrderStatus.READY_FOR_PICKUP)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  Mark Ready
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
                {(() => {
                  const tabs: { id: 'details' | 'timeline' | 'documents'; name: string }[] = [
                    { id: 'details', name: 'Order Details' },
                    { id: 'timeline', name: 'Timeline' },
                    { id: 'documents', name: 'Documents' }
                  ];

                  return tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-4 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ));
                })()}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Material Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Material Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={order.material.photos[0]?.url || '/api/placeholder/80/80'}
                      alt={order.material.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">{order.material.title}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">Category: {order.material.category}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span>Quantity: <strong>{order.quantity}</strong></span>
                        <span>Unit Price: <strong>LKR {order.unitPrice.toLocaleString()}</strong></span>
                        <span>Total: <strong>LKR {order.totalAmount.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Buyer Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                      <p className="mt-1 text-gray-900 dark:text-white">{order.buyerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <div className="mt-1 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900 dark:text-white">{order.buyerEmail}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <div className="mt-1 flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900 dark:text-white">{order.buyerPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pickup Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pickup Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                      <div className="mt-1 flex items-start">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-gray-900 dark:text-white">
                          {order.pickupLocation.address}<br />
                          {order.pickupLocation.city}, {order.pickupLocation.province}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Date</label>
                      <div className="mt-1 flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900 dark:text-white">
                          {order.expectedPickupDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {order.specialInstructions && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Special Instructions</label>
                      <p className="mt-1 text-gray-900 dark:text-white">{order.specialInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Information</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <p className="mt-1 font-medium">{order.paymentStatus.toUpperCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
                      <p className="mt-1 text-gray-900 dark:text-white">{order.paymentMethod || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                      <p className="mt-1 text-gray-900 dark:text-white font-semibold">LKR {order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              {order.rating && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Rating</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < order.rating!.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({order.rating.rating}/5)
                      </span>
                    </div>
                    {order.rating.comment && (
                      <p className="text-gray-900 dark:text-white">{order.rating.comment}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Timeline</h4>
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.timeline.map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== order.timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                              <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {event.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Updated by {event.updatedBy}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {event.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Documents</h4>
              {order.documents.length > 0 ? (
                <div className="space-y-3">
                  {order.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.filename}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.type.replace('_', ' ')} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No documents uploaded yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
