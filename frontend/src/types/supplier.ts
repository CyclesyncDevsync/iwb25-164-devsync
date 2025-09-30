export interface Material {
  id: string;
  title: string;
  description: string;
  category: MaterialCategory;
  subCategory: string;
  quantity: number;
  unit: string;
  condition: QualityGrade;
  qualityScore: number;
  photos: MaterialPhoto[];
  location: Location;
  pricing: MaterialPricing;
  status: MaterialStatus;
  createdAt: Date;
  updatedAt: Date;
  supplierId: string;
  supplierType: SupplierType;
  isVerified: boolean;
  verificationDate?: Date;
  agentId?: string;
  auctionId?: string;
  specifications: MaterialSpecification;
  tags: string[];
  estimatedPickupDate?: Date;
  availability: AvailabilityStatus;
  deliveryMethod?: string;
  
  // Enhanced fields
  aiAnalysis?: AIAnalysisResult;
  agentAssignment?: AgentAssignment;
  agentReview?: AgentReview;
  workflow: MaterialWorkflowStatus;
}

// AI Analysis types
export interface AIAnalysisResult {
  assessmentId: string;
  overallScore: number;
  qualityGrade: string;
  approved: boolean;
  recommendations: string[];
  issues: string[];
  nextAction: string;
  rejectionReason?: string;
  analyzedAt: Date;
  visionAnalysis: VisionAnalysis;
}

export interface VisionAnalysis {
  detectedObjects: ObjectDetection[];
  detectedText: TextAnnotation[];
  imageProperties: ImageProperties;
  safeSearch: SafeSearchAnnotation;
}

export interface ObjectDetection {
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
  category?: string;
}

export interface TextAnnotation {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  language?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageProperties {
  dominantColors: ColorInfo[];
  aspectRatio: number;
  imageWidth: number;
  imageHeight: number;
  cropHints: any[];
}

export interface ColorInfo {
  color: RGB;
  fraction: number;
  pixelFraction: number;
}

export interface RGB {
  red: number;
  green: number;
  blue: number;
}

export interface SafeSearchAnnotation {
  adult: string;
  spoof: string;
  medical: string;
  violence: string;
  racy: string;
}

// Agent Assignment types
export interface AgentAssignment {
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  estimatedArrival: Date;
  actualArrival?: Date;
  visitCost: number;
  distanceFromMaterial: number;
  assignedAt: Date;
  status: AgentAssignmentStatus;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export enum AgentAssignmentStatus {
  ASSIGNED = 'assigned',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Agent Review types
export interface AgentReview {
  reviewId: string;
  agentId: string;
  materialId: string;
  overallScore: number;
  qualityGrade: string;
  approved: boolean;
  findings: AgentFindings;
  recommendations: string[];
  issues: string[];
  photos: MaterialPhoto[];
  visitCost: number;
  reviewDate: Date;
  nextAction: string;
  rejectionReason?: string;
  notes?: string;
}

export interface AgentFindings {
  actualCondition: QualityGrade;
  actualQuantity: number;
  contamination: ContaminationLevel;
  packaging: PackagingCondition;
  accessibility: AccessibilityLevel;
  marketability: MarketabilityScore;
  specialNotes?: string;
}

export enum ContaminationLevel {
  NONE = 'none',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  SEVERE = 'severe'
}

export enum PackagingCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged'
}

export enum AccessibilityLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult',
  VERY_DIFFICULT = 'very_difficult'
}

export interface MarketabilityScore {
  score: number;
  factors: string[];
  marketDemand: 'high' | 'medium' | 'low';
  competitivePrice: boolean;
}

// Material Workflow Status
export interface MaterialWorkflowStatus {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  nextStage?: WorkflowStage;
  stageHistory: StageHistoryItem[];
  estimatedCompletion?: Date;
  blockers?: WorkflowBlocker[];
}

export enum WorkflowStage {
  SUBMITTED = 'submitted',
  AI_ANALYZING = 'ai_analyzing',
  AI_APPROVED = 'ai_approved',
  AI_REJECTED = 'ai_rejected',
  AGENT_ASSIGNED = 'agent_assigned',
  AGENT_EN_ROUTE = 'agent_en_route',
  AGENT_REVIEWING = 'agent_reviewing',
  AGENT_APPROVED = 'agent_approved',
  AGENT_REJECTED = 'agent_rejected',
  AUCTION_LISTED = 'auction_listed',
  AUCTION_ACTIVE = 'auction_active',
  AUCTION_COMPLETED = 'auction_completed',
  PAYMENT_PENDING = 'payment_pending',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface StageHistoryItem {
  stage: WorkflowStage;
  timestamp: Date;
  actor: string;
  actorType: 'system' | 'supplier' | 'agent' | 'buyer' | 'admin';
  notes?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowBlocker {
  blockerId: string;
  stage: WorkflowStage;
  blockerType: 'quality_issue' | 'logistics_issue' | 'payment_issue' | 'system_issue';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface MaterialPhoto {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  isMain: boolean;
  caption?: string;
  uploadedAt: Date;
}

export interface MaterialPricing {
  expectedPrice: number;
  minimumPrice: number;
  pricePerUnit: number;
  currency: string;
  negotiable: boolean;
  bulkDiscounts?: BulkDiscount[];
}

export interface BulkDiscount {
  minQuantity: number;
  discountPercentage: number;
}

export interface MaterialSpecification {
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  material: string;
  color?: string;
  brand?: string;
  model?: string;
  manufacturingYear?: number;
  additionalDetails: Record<string, any>;
}

export interface Location {
  address: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SupplierProfile {
  id: string;
  type: SupplierType;
  businessName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Location;
  registrationNumber?: string;
  taxId?: string;
  bankDetails: BankDetails;
  verificationStatus: VerificationStatus;
  rating: number;
  totalMaterialsSold: number;
  totalEarnings: number;
  joinedDate: Date;
  preferences: SupplierPreferences;
  documents: SupplierDocument[];
  teamMembers?: TeamMember[];
  locations?: Location[];
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  branchCode: string;
  swiftCode?: string;
}

export interface SupplierDocument {
  id: string;
  type: DocumentType;
  filename: string;
  url: string;
  status: DocumentStatus;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  comments?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: Permission[];
  addedAt: Date;
  isActive: boolean;
}

export interface SupplierPreferences {
  notificationSettings: SupplierNotificationPreferences;
  defaultLocation: Location;
  preferredCategories: MaterialCategory[];
  autoApproveLimit: number;
  requirePhotos: boolean;
  language: 'en' | 'si' | 'ta';
}

export interface SupplierNotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  auctionUpdates: boolean;
  paymentAlerts: boolean;
  systemMessages: boolean;
}

export interface SupplierAnalytics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalMaterials: number;
  soldMaterials: number;
  activeMaterials: number;
  averageRating: number;
  conversionRate: number;
  topCategories: CategoryPerformance[];
  earningsHistory: EarningsData[];
  materialPerformance: MaterialPerformance[];
  marketInsights: MarketInsight[];
  successMetrics: SuccessMetric[];
}

export interface CategoryPerformance {
  category: MaterialCategory;
  totalSales: number;
  totalEarnings: number;
  averagePrice: number;
  conversionRate: number;
}

export interface EarningsData {
  date: string;
  earnings: number;
  transactions: number;
  averageOrderValue: number;
}

export interface MaterialPerformance {
  materialId: string;
  title: string;
  views: number;
  bids: number;
  finalPrice: number;
  daysToSell: number;
  category: MaterialCategory;
}

export interface MarketInsight {
  category: MaterialCategory;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
  averagePrice: number;
  competitorCount: number;
  recommendation: string;
}

export interface SuccessMetric {
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface MaterialRegistrationForm {
  title: string;
  description: string;
  category: MaterialCategory;
  subCategory: string;
  quantity: number;
  unit: string;
  condition: QualityGrade;
  photos: File[];
  location: Location;
  expectedPrice: number;
  minimumPrice: number;
  negotiable: boolean;
  specifications: MaterialSpecification;
  tags: string[];
  estimatedPickupDate?: Date;
}

// Enums
export enum SupplierType {
  INDIVIDUAL = 'individual',
  ORGANIZATION = 'organization'
}

export enum MaterialCategory {
  PLASTIC = 'plastic',
  METAL = 'metal',
  PAPER = 'paper',
  GLASS = 'glass',
  ELECTRONICS = 'electronics',
  TEXTILES = 'textiles',
  RUBBER = 'rubber',
  WOOD = 'wood',
  ORGANIC = 'organic',
  COMPOSITES = 'composites'
}

export enum QualityGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum MaterialStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_AUCTION = 'in_auction',
  SOLD = 'sold',
  ARCHIVED = 'archived'
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  PENDING_PICKUP = 'pending_pickup',
  COLLECTED = 'collected',
  UNAVAILABLE = 'unavailable'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum DocumentType {
  BUSINESS_REGISTRATION = 'business_registration',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  IDENTITY_PROOF = 'identity_proof',
  ADDRESS_PROOF = 'address_proof'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum TeamRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export enum Permission {
  CREATE_MATERIALS = 'create_materials',
  EDIT_MATERIALS = 'edit_materials',
  DELETE_MATERIALS = 'delete_materials',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_TEAM = 'manage_team',
  MANAGE_SETTINGS = 'manage_settings',
  APPROVE_MATERIALS = 'approve_materials'
}

// Order Management Interfaces
export interface Order {
  id: string;
  orderNumber: string;
  materialId: string;
  material: Material;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
  expectedPickupDate?: Date;
  actualPickupDate?: Date;
  pickupLocation: Location;
  specialInstructions?: string;
  agentId?: string;
  agentName?: string;
  trackingNumber?: string;
  documents: OrderDocument[];
  timeline: OrderTimeline[];
  rating?: OrderRating;
}

export interface OrderDocument {
  id: string;
  type: OrderDocumentType;
  filename: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface OrderTimeline {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  description: string;
  updatedBy: string;
  notes?: string;
}

export interface OrderRating {
  id: string;
  rating: number;
  comment?: string;
  ratedAt: Date;
  ratedBy: 'buyer' | 'supplier';
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL = 'partial'
}

export enum OrderDocumentType {
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  PICKUP_CONFIRMATION = 'pickup_confirmation',
  DELIVERY_PROOF = 'delivery_proof',
  QUALITY_CERTIFICATE = 'quality_certificate'
}

// Settings Management Interfaces
export interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    paymentConfirmations: boolean;
    systemNotifications: boolean;
    marketingEmails: boolean;
  };
  sms: {
    urgentAlerts: boolean;
    orderStatusUpdates: boolean;
    paymentReminders: boolean;
  };
  push: {
    realTimeNotifications: boolean;
    dailySummary: boolean;
    weeklyReports: boolean;
  };
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
  loginAlerts: boolean;
  passwordExpiry: number; // in days
  allowedIpAddresses: string[];
}

export interface BusinessSettings {
  companyName: string;
  businessType: string;
  taxId: string;
  certifications: string[];
  operatingHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  autoAcceptOrders: boolean;
  minimumOrderValue: number;
  preferredPaymentMethods: string[];
}

export interface ApiSettings {
  webhookUrl: string;
  apiKey: string;
  rateLimit: number;
  allowedOrigins: string[];
  enableLogging: boolean;
}

export interface SupplierSettings {
  id: string;
  supplierId: string;
  notifications: NotificationSettings;
  security: SecuritySettings;
  business: BusinessSettings;
  api: ApiSettings;
  createdAt: string;
  updatedAt: string;
}
