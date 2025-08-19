// Buyer-specific types and interfaces

export interface Material {
  id: string;
  title: string;
  description: string;
  category: MaterialCategory;
  price: number;
  unit: string;
  quality: number; // 1-10 scale
  location: string;
  distance: number; // in kilometers
  supplier: Supplier;
  images: string[];
  availableQuantity: number;
  isLiked: boolean;
  isSaved: boolean;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  isAuction?: boolean;
  auctionEndTime?: string;
  tags?: string[];
  specifications?: MaterialSpecification[];
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export interface Supplier {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  contact: string;
  address: string;
  avatar?: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
  joinedDate: string;
  totalSales: number;
  responseTime: string; // e.g., "2 hours"
  languages: string[];
}

export interface MaterialSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface SearchFilters {
  category: MaterialCategory | '';
  location: string;
  minPrice: number;
  maxPrice: number;
  minQuality: number;
  maxDistance: number;
  verifiedOnly: boolean;
  auctionsOnly?: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  supplierRating?: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
  lastUsed: string;
  alertsEnabled: boolean;
}

export interface Auction {
  id: string;
  material: Material;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  timeLeft: number; // in seconds
  status: 'upcoming' | 'live' | 'ending_soon' | 'ended';
  totalBids: number;
  participants: number;
  isParticipating: boolean;
  myHighestBid?: number;
  myPosition?: number;
  autoBidEnabled: boolean;
  autoBidMax?: number;
  auctionType: 'standard' | 'buy_now' | 'reserve' | 'dutch';
  incrementAmount: number;
  bidHistory: BidRecord[];
}

export interface BidRecord {
  id: string;
  auctionId: string;
  amount: number;
  timestamp: string;
  bidder: string;
  isMyBid: boolean;
  isWinning?: boolean;
  autoBid?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  material: Material;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  supplier: Supplier;
  tracking: TrackingInfo;
  payment: PaymentInfo;
  canRate: boolean;
  canDispute: boolean;
  canCancel: boolean;
  rating?: Rating;
  notes?: string;
  attachments?: string[];
}

export interface TrackingInfo {
  trackingNumber?: string;
  status: string;
  location: string;
  lastUpdate: string;
  estimatedArrival: string;
  carrier?: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paidAmount: number;
  paidAt?: string;
  refundAmount?: number;
  refundedAt?: string;
}

export interface Rating {
  id: string;
  orderId: string;
  supplierId: string;
  rating: number; // 1-5 scale
  review?: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
  categories: {
    quality: number;
    delivery: number;
    communication: number;
    packaging: number;
  };
}

export interface PurchaseAnalytics {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  deliverySuccessRate: number;
  categoryBreakdown: CategorySpending[];
  monthlySpending: MonthlySpending[];
  supplierPerformance: SupplierPerformance[];
  savingsAnalysis: SavingsData;
  trends: {
    spendingTrend: 'up' | 'down' | 'stable';
    orderVolumeTrend: 'up' | 'down' | 'stable';
    qualityTrend: 'up' | 'down' | 'stable';
  };
}

export interface CategorySpending {
  category: MaterialCategory;
  amount: number;
  percentage: number;
  orderCount: number;
  averagePrice: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface SupplierPerformance {
  supplier: Supplier;
  totalOrders: number;
  totalSpent: number;
  averageRating: number;
  onTimeDelivery: number; // percentage
  qualityScore: number;
  communicationScore: number;
}

export interface SavingsData {
  traditionalCost: number;
  circularCost: number;
  totalSavings: number;
  savingsPercentage: number;
  monthlySavings: {
    month: string;
    traditional: number;
    circular: number;
    savings: number;
  }[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'order' | 'auction' | 'payment' | 'system' | 'marketing';
}

export interface Wishlist {
  id: string;
  name: string;
  description?: string;
  materials: Material[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  id: string;
  materialId: string;
  targetPrice: number;
  condition: 'below' | 'above' | 'equal';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

// Enums
export type MaterialCategory = 
  | 'plastic' 
  | 'paper' 
  | 'metal' 
  | 'glass' 
  | 'textile' 
  | 'electronic' 
  | 'organic' 
  | 'rubber' 
  | 'wood' 
  | 'ceramic';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'disputed'
  | 'refunded';

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'net_banking'
  | 'wallet'
  | 'bank_transfer'
  | 'cash_on_delivery';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partial_refund';

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'auction_starting'
  | 'auction_ending'
  | 'auction_won'
  | 'auction_outbid'
  | 'price_alert'
  | 'payment_success'
  | 'payment_failed'
  | 'new_material'
  | 'system_maintenance';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResponse {
  materials: Material[];
  total: number;
  suggestions: string[];
  filters: {
    categories: { name: string; count: number; }[];
    locations: { name: string; count: number; }[];
    priceRanges: { min: number; max: number; count: number; }[];
  };
}

// Form Types
export interface ContactSupplierForm {
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  preferredContact: 'chat' | 'email' | 'phone';
}

export interface DisputeForm {
  orderId: string;
  category: 'quality' | 'delivery' | 'quantity' | 'damage' | 'other';
  description: string;
  evidence: File[];
  requestedResolution: 'refund' | 'replacement' | 'partial_refund' | 'compensation';
}

export interface ProfileUpdateForm {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showProfile: boolean;
      showPurchaseHistory: boolean;
    };
  };
}

// Component Props Types
export interface MaterialCardProps {
  material: Material;
  viewMode: 'grid' | 'list';
  onLike: (materialId: string) => void;
  onSave: (materialId: string) => void;
  onViewDetails: (material: Material) => void;
  onContact: (material: Material) => void;
  showActions?: boolean;
}

export interface AuctionCardProps {
  auction: Auction;
  onJoin: (auctionId: string) => void;
  onWatch: (auctionId: string) => void;
  showWatchButton?: boolean;
}

export interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
  onContactSupplier: (supplierId: string) => void;
  onRateOrder: (orderId: string) => void;
  onDispute: (orderId: string) => void;
  showActions?: boolean;
}
