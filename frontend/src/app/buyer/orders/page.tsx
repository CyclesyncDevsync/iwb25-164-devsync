'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { createDeliveryEventFromOrder, createCalendarEvent } from '../../../services/calendarService';

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: 'confirmed' | 'in_transit' | 'delivered' | 'cancelled' | 'disputed';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  supplier: {
    name: string;
    rating: number;
    contact: string;
    address: string;
  };
  tracking: {
    status: string;
    location: string;
    lastUpdate: string;
    estimatedArrival: string;
  };
  payment: {
    method: string;
    status: 'paid' | 'pending' | 'refunded';
    transactionId: string;
  };
  images: string[];
  canRate: boolean;
  canDispute: boolean;
  rating?: number;
  review?: string;
}

interface DeliveryUpdate {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarOrder, setSelectedCalendarOrder] = useState<Order | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('10:00');

  const openCalendarModal = (order: Order) => {
    setSelectedCalendarOrder(order);
    // Set default date to today
    const today = new Date();
    setCustomDate(today.toISOString().split('T')[0]);
    setShowCalendarModal(true);
  };

  const addToCalendar = async () => {
    if (!selectedCalendarOrder) return;

    setCalendarLoading(selectedCalendarOrder.id);
    try {
      console.log('Creating calendar event for order:', selectedCalendarOrder);

      // Create custom date/time
      const [hours, minutes] = customTime.split(':');
      const eventDate = new Date(customDate);
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0);

      // Create end time (1 hour later)
      const endDate = new Date(eventDate);
      endDate.setHours(eventDate.getHours() + 1);

      // Format dates
      const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hrs = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const secs = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hrs}:${mins}:${secs}`;
      };

      const calendarEvent = {
        summary: `Delivery: ${selectedCalendarOrder.title}`,
        description: `Order #${selectedCalendarOrder.orderNumber}\nQuantity: ${selectedCalendarOrder.quantity || 'N/A'} ${selectedCalendarOrder.unit || ''}\nSupplier: ${selectedCalendarOrder.supplier?.name || 'Unknown'}`,
        startTime: formatDateTime(eventDate),
        endTime: formatDateTime(endDate),
        location: selectedCalendarOrder.supplier?.address || ''
      };

      console.log('Calendar event payload:', calendarEvent);

      const response = await createCalendarEvent(calendarEvent);
      console.log('Calendar API response:', response);

      if (response.status === 'success') {
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        alert(
          `✅ Delivery reminder added to your Google Calendar!\n\n` +
          `📦 Order: ${selectedCalendarOrder.title}\n` +
          `📅 Date: ${formattedDate}\n` +
          `🕐 Time: ${formattedTime}\n` +
          `📍 Location: ${selectedCalendarOrder.supplier?.address || 'N/A'}\n\n` +
          `Event ID: ${response.eventId}`
        );

        setShowCalendarModal(false);
        setSelectedCalendarOrder(null);
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

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      title: 'Premium Plastic Bottles - PET Grade A',
      category: 'Plastic',
      quantity: 500,
      unit: 'kg',
      totalAmount: 7500,
      status: 'in_transit',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-16',
      supplier: {
        name: 'EcoRecycle Ltd.',
        rating: 4.8,
        contact: '+91 98765 43210',
        address: 'Mumbai, Maharashtra'
      },
      tracking: {
        status: 'In Transit',
        location: 'Pune Distribution Center',
        lastUpdate: '2 hours ago',
        estimatedArrival: 'Tomorrow, 2:00 PM'
      },
      payment: {
        method: 'UPI',
        status: 'paid',
        transactionId: 'TXN123456789'
      },
      images: ['/api/placeholder/400/300'],
      canRate: false,
      canDispute: true
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      title: 'Mixed Paper Waste - Office Grade',
      category: 'Paper',
      quantity: 200,
      unit: 'kg',
      totalAmount: 1600,
      status: 'delivered',
      orderDate: '2024-01-05',
      expectedDelivery: '2024-01-12',
      actualDelivery: '2024-01-11',
      supplier: {
        name: 'Paper Solutions',
        rating: 4.2,
        contact: '+91 98765 43211',
        address: 'Delhi, NCR'
      },
      tracking: {
        status: 'Delivered',
        location: 'Your Location',
        lastUpdate: '3 days ago',
        estimatedArrival: 'Delivered'
      },
      payment: {
        method: 'Bank Transfer',
        status: 'paid',
        transactionId: 'TXN123456790'
      },
      images: ['/api/placeholder/400/300'],
      canRate: true,
      canDispute: false,
      rating: 4
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      title: 'Aluminum Scrap - Food Grade',
      category: 'Metal',
      quantity: 100,
      unit: 'kg',
      totalAmount: 8500,
      status: 'confirmed',
      orderDate: '2024-01-14',
      expectedDelivery: '2024-01-20',
      supplier: {
        name: 'Metro Metals',
        rating: 4.6,
        contact: '+91 98765 43212',
        address: 'Bangalore, Karnataka'
      },
      tracking: {
        status: 'Order Confirmed',
        location: 'Supplier Warehouse',
        lastUpdate: '1 day ago',
        estimatedArrival: 'Jan 20, 3:00 PM'
      },
      payment: {
        method: 'Credit Card',
        status: 'paid',
        transactionId: 'TXN123456791'
      },
      images: ['/api/placeholder/400/300'],
      canRate: false,
      canDispute: false
    }
  ]);

  const deliveryUpdates: DeliveryUpdate[] = [
    {
      id: '1',
      status: 'In Transit',
      location: 'Pune Distribution Center',
      timestamp: '2024-01-15 14:30',
      description: 'Package is on the way to your location'
    },
    {
      id: '2',
      status: 'Shipped',
      location: 'Mumbai Warehouse',
      timestamp: '2024-01-14 09:15',
      description: 'Package has been shipped from supplier'
    },
    {
      id: '3',
      status: 'Confirmed',
      location: 'Supplier Location',
      timestamp: '2024-01-10 16:45',
      description: 'Order confirmed and being prepared'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-yellow-600 bg-yellow-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'disputed': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return ClockIcon;
      case 'in_transit': return TruckIcon;
      case 'delivered': return CheckCircleIcon;
      case 'cancelled': return ExclamationTriangleIcon;
      case 'disputed': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const submitRating = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, rating, review, canRate: false }
        : order
    ));
    setShowRatingModal(false);
    setRating(0);
    setReview('');
  };

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active': return ['confirmed', 'in_transit'].includes(order.status);
      case 'delivered': return order.status === 'delivered';
      case 'cancelled': return ['cancelled', 'disputed'].includes(order.status);
      default: return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'active', label: 'Active', count: orders.filter(o => ['confirmed', 'in_transit'].includes(o.status)).length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => ['cancelled', 'disputed'].includes(o.status)).length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const StatusIcon = getStatusIcon(order.status);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{order.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">Ordered on {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">Rs.{order.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{order.quantity} {order.unit}</p>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Supplier Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Supplier</h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.supplier.name}</p>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span>{order.supplier.rating}</span>
                        </div>
                        <p className="text-gray-500">{order.supplier.address}</p>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Delivery</h4>
                      <div className="text-sm space-y-1">
                        <p>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</p>
                        {order.actualDelivery && (
                          <p className="text-green-600">
                            Delivered: {new Date(order.actualDelivery).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-gray-500">{order.tracking.status}</p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Payment</h4>
                      <div className="text-sm space-y-1">
                        <p>{order.payment.method}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.payment.status.toUpperCase()}
                        </span>
                        <p className="text-gray-500">ID: {order.payment.transactionId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Bar */}
                  {order.status === 'in_transit' && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-800">
                          {order.tracking.status}
                        </span>
                        <span className="text-sm text-yellow-600">
                          ETA: {order.tracking.estimatedArrival}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{order.tracking.location}</span>
                        <span>•</span>
                        <span>Updated {order.tracking.lastUpdate}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-1" />
                      View Details
                    </button>

                    {order.status === 'in_transit' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowTrackingModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <TruckIcon className="h-4 w-4 inline mr-1" />
                        Track Order
                      </button>
                    )}

                    {(order.status === 'confirmed' || order.status === 'in_transit') && (
                      <button
                        onClick={() => openCalendarModal(order)}
                        disabled={calendarLoading === order.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        {calendarLoading === order.id ? 'Adding...' : 'Add to Calendar'}
                      </button>
                    )}

                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-1" />
                      Contact Supplier
                    </button>

                    {order.canRate && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowRatingModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        <StarIcon className="h-4 w-4 inline mr-1" />
                        Rate & Review
                      </button>
                    )}

                    {order.canDispute && (
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                        Report Issue
                      </button>
                    )}

                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                      Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && !showRatingModal && !showTrackingModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="border-b pb-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">{selectedOrder.title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Order Number:</span>
                        <p className="font-medium">{selectedOrder.orderNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium">{selectedOrder.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Amount:</span>
                        <p className="font-medium">Rs.{selectedOrder.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Details */}
                  <div className="border-b pb-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Supplier Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>{selectedOrder.supplier.name}</span>
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span>{selectedOrder.supplier.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.supplier.contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span>{selectedOrder.supplier.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="border-b pb-6 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Payment Method:</span>
                        <p className="font-medium">{selectedOrder.payment.method}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ml-2 ${
                          selectedOrder.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedOrder.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.payment.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Transaction ID:</span>
                        <p className="font-medium">{selectedOrder.payment.transactionId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Review */}
                  {selectedOrder.rating && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Your Rating & Review</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={`h-5 w-5 ${star <= selectedOrder.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {selectedOrder.review && (
                        <p className="text-sm text-gray-600">{selectedOrder.review}</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Modal */}
        <AnimatePresence>
          {showRatingModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowRatingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">How was your experience with {selectedOrder.supplier.name}?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <StarSolidIcon
                            className={`h-8 w-8 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write a review (optional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      placeholder="Share your experience with other buyers..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRatingModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitRating(selectedOrder.id)}
                      disabled={rating === 0}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Rating
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Modal */}
        <AnimatePresence>
          {showTrackingModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowTrackingModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Track Your Order</h3>
                    <button
                      onClick={() => setShowTrackingModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Order #{selectedOrder.orderNumber}</p>
                    <p className="font-medium">{selectedOrder.title}</p>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="space-y-4">
                    {deliveryUpdates.map((update, index) => (
                      <div key={update.id} className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{update.status}</span>
                            <span className="text-sm text-gray-500">{update.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{update.location}</p>
                          <p className="text-sm text-gray-500">{update.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Estimated Arrival</span>
                    </div>
                    <p className="text-blue-800">{selectedOrder.tracking.estimatedArrival}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Date Picker Modal */}
        <AnimatePresence>
          {showCalendarModal && selectedCalendarOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCalendarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add to Calendar</h3>
                    <button
                      onClick={() => setShowCalendarModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Order:</span> {selectedCalendarOrder.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Expected Delivery:</span>{' '}
                      {new Date(selectedCalendarOrder.expectedDelivery).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time
                      </label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Reminder will be added for:{' '}
                        <span className="font-medium">
                          {customDate && new Date(customDate + 'T' + customTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCalendarModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addToCalendar}
                      disabled={!customDate || calendarLoading === selectedCalendarOrder.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calendarLoading === selectedCalendarOrder.id ? 'Adding...' : 'Add to Calendar'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage;
