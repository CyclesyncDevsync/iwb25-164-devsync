'use client';

import React, { useState, useEffect } from 'react';
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
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { deliveryService } from '../../../services/deliveryService';

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
  delivery?: {
    status: string;
    currentLocation: string;
    estimatedDeliveryDate: string;
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    updates: DeliveryUpdate[];
  };
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
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch delivery data for known order IDs
        const orderIds = ['ord-2024-001', 'ord-2024-002', 'ord-2024-003'];
        const deliveryPromises = orderIds.map(id => deliveryService.getDeliveryByOrderId(id));
        const deliveries = await Promise.all(deliveryPromises);

        const ordersData: Order[] = deliveries
          .filter(delivery => delivery !== null)
          .map(delivery => {
            if (!delivery) return null;

            const statusMap: any = {
              'pending': 'confirmed',
              'pickup_scheduled': 'confirmed',
              'picked_up': 'in_transit',
              'in_transit': 'in_transit',
              'out_for_delivery': 'in_transit',
              'delivered': 'delivered',
              'failed': 'cancelled',
              'returned': 'cancelled'
            };

            return {
              id: delivery.orderId,
              orderNumber: delivery.orderId.toUpperCase(),
              title: `Order ${delivery.orderId}`,
              category: 'Materials',
              quantity: 500,
              unit: 'kg',
              totalAmount: 7500,
              status: statusMap[delivery.status] || 'confirmed',
              orderDate: delivery.createdAt.toISOString().split('T')[0],
              expectedDelivery: delivery.estimatedDeliveryDate?.toISOString().split('T')[0] || '',
              actualDelivery: delivery.actualDeliveryDate?.toISOString().split('T')[0],
              supplier: {
                name: delivery.driverName || 'Supplier Name',
                rating: 4.5,
                contact: delivery.driverPhone || '+00 00000 00000',
                address: delivery.currentLocation || 'Location'
              },
              tracking: {
                status: delivery.status.replace('_', ' ').toUpperCase(),
                location: delivery.currentLocation || '',
                lastUpdate: delivery.updatedAt.toLocaleString(),
                estimatedArrival: delivery.estimatedDeliveryDate?.toLocaleString() || ''
              },
              payment: {
                method: 'Bank Transfer',
                status: 'paid' as const,
                transactionId: `TXN${delivery.id.slice(0, 12)}`
              },
              images: ['/api/placeholder/400/300'],
              canRate: delivery.status === 'delivered',
              canDispute: delivery.status !== 'delivered' && delivery.status !== 'cancelled',
              delivery: {
                status: delivery.status,
                currentLocation: delivery.currentLocation || '',
                estimatedDeliveryDate: delivery.estimatedDeliveryDate?.toISOString() || '',
                driverName: delivery.driverName,
                driverPhone: delivery.driverPhone,
                vehicleNumber: delivery.vehicleNumber,
                updates: delivery.updates.map(update => ({
                  id: update.id,
                  status: update.status,
                  location: update.location,
                  timestamp: update.timestamp.toISOString(),
                  description: update.description
                }))
              }
            };
          })
          .filter(order => order !== null) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
                      <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
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

                  {/* Enhanced Delivery Tracking Bar */}
                  {order.status === 'in_transit' && order.delivery && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TruckIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">
                            {order.delivery.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-blue-700 font-medium">
                          ETA: {new Date(order.delivery.estimatedDeliveryDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <MapPinIcon className="h-4 w-4" />
                          <span className="font-medium">Current Location:</span>
                          <span>{order.delivery.currentLocation}</span>
                        </div>

                        {order.delivery.driverName && (
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <UserIcon className="h-4 w-4" />
                            <span>Driver: {order.delivery.driverName}</span>
                            {order.delivery.driverPhone && (
                              <>
                                <span>•</span>
                                <PhoneIcon className="h-4 w-4" />
                                <span>{order.delivery.driverPhone}</span>
                              </>
                            )}
                          </div>
                        )}

                        {order.delivery.vehicleNumber && (
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <TruckIcon className="h-4 w-4" />
                            <span>Vehicle: {order.delivery.vehicleNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show delivery info for delivered orders too */}
                  {order.status === 'delivered' && order.delivery && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">
                          Delivered on {new Date(order.actualDelivery!).toLocaleDateString()}
                        </span>
                        {order.delivery.driverName && (
                          <>
                            <span>•</span>
                            <span>by {order.delivery.driverName}</span>
                          </>
                        )}
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
                        <p className="font-medium">₹{selectedOrder.totalAmount.toLocaleString()}</p>
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

                  {/* Delivery Information */}
                  {selectedOrder.delivery && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Delivery Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedOrder.delivery.driverName && (
                          <div>
                            <span className="text-blue-700">Driver:</span>
                            <p className="text-blue-900 font-medium">{selectedOrder.delivery.driverName}</p>
                          </div>
                        )}
                        {selectedOrder.delivery.driverPhone && (
                          <div>
                            <span className="text-blue-700">Phone:</span>
                            <p className="text-blue-900 font-medium">{selectedOrder.delivery.driverPhone}</p>
                          </div>
                        )}
                        {selectedOrder.delivery.vehicleNumber && (
                          <div>
                            <span className="text-blue-700">Vehicle:</span>
                            <p className="text-blue-900 font-medium">{selectedOrder.delivery.vehicleNumber}</p>
                          </div>
                        )}
                        {selectedOrder.delivery.currentLocation && (
                          <div>
                            <span className="text-blue-700">Current Location:</span>
                            <p className="text-blue-900 font-medium">{selectedOrder.delivery.currentLocation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tracking Timeline */}
                  <div className="space-y-4">
                    {(selectedOrder.delivery?.updates || deliveryUpdates).map((update, index) => (
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
      </div>
    </div>
  );
};

export default OrdersPage;
