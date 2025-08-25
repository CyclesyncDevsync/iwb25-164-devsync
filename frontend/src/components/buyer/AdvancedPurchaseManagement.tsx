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
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface DeliveryUpdate {
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
}

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
    updates: DeliveryUpdate[];
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

interface QualityCheck {
  id: string;
  orderId: string;
  checkDate: string;
  inspector: string;
  overallRating: number;
  categories: {
    appearance: number;
    functionality: number;
    packaging: number;
    documentation: number;
  };
  issues: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    photos?: string[];
  }>;
  recommendations: string[];
  approved: boolean;
}

interface AdvancedPurchaseManagementProps {
  orders: PurchaseOrder[];
  onCancelOrder: (orderId: string, reason: string) => Promise<boolean>;
  onInitiateReturn: (orderId: string, reason: string, items: string[]) => Promise<boolean>;
  onRaiseDispute: (orderId: string, category: string, description: string) => Promise<boolean>;
  onRateOrder: (orderId: string, rating: number, review: string) => Promise<boolean>;
  onContactSupplier: (supplierId: string, message: string) => void;
  onTrackDelivery: (trackingId: string) => void;
  onScheduleDelivery: (orderId: string, timeSlot: string) => Promise<boolean>;
  onRequestQualityCheck: (orderId: string) => Promise<boolean>;
}

const AdvancedPurchaseManagement: React.FC<AdvancedPurchaseManagementProps> = ({
  orders,
  onCancelOrder,
  onInitiateReturn,
  onRaiseDispute,
  onRateOrder,
  onContactSupplier,
  onTrackDelivery,
  onScheduleDelivery,
  onRequestQualityCheck
}) => {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'tracking' | 'documents' | 'communication'>('details');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'issues'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Real-time delivery tracking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate delivery updates
      if (Math.random() > 0.8) {
        const activeOrders = orders.filter(order => 
          ['in_transit', 'out_for_delivery'].includes(order.status)
        );
        
        if (activeOrders.length > 0) {
          const randomOrder = activeOrders[Math.floor(Math.random() * activeOrders.length)];
          const newNotification = `Order ${randomOrder.orderNumber}: Package updated - Now in ${Math.random() > 0.5 ? 'transit hub' : 'local facility'}`;
          setNotifications(prev => [newNotification, ...prev].slice(0, 5));
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (filter === 'active' && !['processing', 'confirmed', 'preparing', 'in_transit', 'out_for_delivery'].includes(order.status)) {
      return false;
    }
    if (filter === 'completed' && !['delivered', 'completed'].includes(order.status)) {
      return false;
    }
    if (filter === 'issues' && !['cancelled', 'disputed'].includes(order.status)) {
      return false;
    }

    // Apply search filter
    if (searchQuery && !order.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      in_transit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      disputed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDeliveryProgress = (status: string) => {
    const progress = {
      processing: 10,
      confirmed: 25,
      preparing: 40,
      in_transit: 60,
      out_for_delivery: 85,
      delivered: 100,
      completed: 100
    };
    return progress[status as keyof typeof progress] || 0;
  };

  const renderOrderCard = (order: PurchaseOrder) => (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedOrder(order)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{order.title}</h3>
          <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{order.supplier.name}</span>
          {order.supplier.isVerified && (
            <ShieldCheckIcon className="h-4 w-4 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600">{order.supplier.rating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Quantity</p>
          <p className="font-semibold text-gray-900">{order.quantity} {order.unit}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Order Date</p>
          <p className="font-semibold text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Est. Delivery</p>
          <p className="font-semibold text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Delivery Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
          <span className="text-sm text-gray-600">{getDeliveryProgress(order.status)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getDeliveryProgress(order.status)}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {order.tracking.trackingId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrackDelivery(order.tracking.trackingId);
              }}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              <TruckIcon className="h-4 w-4" />
              Track
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContactSupplier(order.supplier.id, `Regarding order ${order.orderNumber}`);
            }}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Contact
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {order.canCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCancelModal(true);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Cancel
            </button>
          )}
          {order.canRate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRatingModal(true);
              }}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Rate
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedOrder(null)}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedOrder.title}</h2>
                <p className="text-purple-200">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:bg-purple-500 p-2 rounded-lg"
              >
                ×
              </button>
            </div>

            {/* Status and Progress */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20`}>
                {selectedOrder.status.replace('_', ' ').toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-purple-200 text-sm">Est. Delivery</p>
                <p className="font-semibold">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {['details', 'tracking', 'documents', 'communication'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Supplier Information</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{selectedOrder.supplier.name}</p>
                        {selectedOrder.supplier.isVerified && (
                          <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                          {selectedOrder.supplier.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {selectedOrder.supplier.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4" />
                          {selectedOrder.supplier.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedOrder.quantity} {selectedOrder.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedOrder.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{selectedOrder.payment.breakdown.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">₹{selectedOrder.payment.breakdown.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">₹{selectedOrder.payment.breakdown.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-purple-600">₹{selectedOrder.payment.breakdown.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">
                      {selectedOrder.deliveryAddress.street}<br />
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedOrder.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="space-y-6">
                {/* Tracking Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Tracking</h3>
                    <p className="text-sm text-gray-600">Track ID: {selectedOrder.tracking.trackingId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{selectedOrder.tracking.courier}</p>
                    <p className="text-sm text-gray-600 capitalize">{selectedOrder.tracking.deliveryType} delivery</p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Estimated Delivery Time</span>
                  </div>
                  <p className="text-blue-800">{Math.floor(selectedOrder.tracking.estimatedTime / 60)} hours remaining</p>
                </div>

                {/* Tracking Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Delivery Updates</h4>
                  <div className="space-y-4">
                    {selectedOrder.tracking.updates.map((update, index) => (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {index < selectedOrder.tracking.updates.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900">{update.status}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{update.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{update.location}</span>
                          </div>
                          {update.agent && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{update.agent.name}</p>
                                  <p className="text-sm text-gray-600">Delivery Agent</p>
                                </div>
                                <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                                  <PhoneIcon className="h-4 w-4" />
                                  Call
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Map Placeholder */}
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Live tracking map will appear here</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Order Documents</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'invoice', label: 'Invoice', icon: DocumentTextIcon },
                    { key: 'receipt', label: 'Payment Receipt', icon: CurrencyRupeeIcon },
                    { key: 'qualityCertificate', label: 'Quality Certificate', icon: ShieldCheckIcon },
                    { key: 'deliveryProof', label: 'Delivery Proof', icon: TruckIcon }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-6 w-6 text-gray-400" />
                        <span className="font-medium text-gray-900">{label}</span>
                      </div>
                      {selectedOrder.documents[key as keyof typeof selectedOrder.documents] ? (
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                            <PrinterIcon className="h-4 w-4" />
                            Print
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                            <ShareIcon className="h-4 w-4" />
                            Share
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not available yet</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quality Check Request */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-800">Quality Assurance</h4>
                      <p className="text-sm text-yellow-700">Request an independent quality check for this order</p>
                    </div>
                    <button
                      onClick={() => setShowQualityModal(true)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      Request Check
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Communication History</h3>
                
                {/* Message Thread Placeholder */}
                <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="text-sm text-gray-900">Order confirmed! We'll start preparing your materials right away.</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{selectedOrder.supplier.name} • 2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <div className="flex-1 flex justify-end">
                        <div className="bg-purple-600 text-white rounded-lg p-3 max-w-xs">
                          <p className="text-sm">Thanks for the quick confirmation. Looking forward to the delivery!</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Message */}
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <textarea
                      placeholder="Type your message..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none"
                      rows={3}
                    ></textarea>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 h-fit">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedOrder.canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
              {selectedOrder.canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Return/Exchange
                </button>
              )}
              {selectedOrder.canDispute && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50"
                >
                  Raise Dispute
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {selectedOrder.canRate && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Rate & Review
                </button>
              )}
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Reorder
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Management</h1>
        <p className="text-gray-600">Track and manage all your orders in one place</p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BellIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Recent Updates</span>
            </div>
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <p key={index} className="text-sm text-blue-800">{notification}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Orders</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="issues">Issues</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map(renderOrderCard)}
      </div>

      {/* No Orders Message */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && renderOrderDetails()}
      </AnimatePresence>

      {/* Other Modals would go here (Cancel, Return, Dispute, Rating, Quality) */}
    </div>
  );
};

export default AdvancedPurchaseManagement;
