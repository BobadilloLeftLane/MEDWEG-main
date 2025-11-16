/**
 * TypeScript Types & Interfaces
 * MEDWEG Backend API
 */

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN_APPLICATION = 'admin_application',
  ADMIN_INSTITUTION = 'admin_institution',
  WORKER = 'worker',
}

/**
 * Order Status Enum
 */
export enum OrderStatus {
  SCHEDULED = 'scheduled',
  NEW = 'new',
  APPROVED = 'approved',
  SHIPPED = 'shipped',
}

/**
 * Product Type Enum
 */
export enum ProductType {
  GLOVES = 'gloves',
  DISINFECTANT_LIQUID = 'disinfectant_liquid',
  DISINFECTANT_WIPES = 'disinfectant_wipes',
}

/**
 * Glove Size Enum
 */
export enum GloveSize {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

/**
 * User Interface (from database)
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  institution_id?: string;
  is_verified: boolean;
  verification_code?: string;
  verification_code_expires_at?: Date;
  reset_token?: string;
  reset_token_expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

/**
 * User Response (bez password_hash) - using camelCase for frontend compatibility
 */
export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  patientId?: string; // For workers - their assigned patient
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Institution Interface
 */
export interface Institution {
  id: string;
  name: string;
  address_street: Buffer; // Enkriptovano
  address_plz: string;
  address_city: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Patient Interface
 */
export interface Patient {
  id: string;
  institution_id: string;
  first_name: Buffer; // Enkriptovano
  last_name: Buffer; // Enkriptovano
  address: Buffer; // Enkriptovano
  unique_code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Worker Interface
 */
export interface Worker {
  id: string;
  institution_id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

/**
 * Product Interface
 */
export interface Product {
  id: string;
  name_de: string;
  description_de?: string;
  type: ProductType;
  size?: GloveSize;
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Order Interface
 */
export interface Order {
  id: string;
  institution_id: string;
  patient_id: string;
  created_by_user_id?: string;
  created_by_worker_id?: string;
  status: OrderStatus;
  is_recurring: boolean;
  scheduled_date?: Date;
  is_confirmed: boolean;
  approved_by_admin_id?: string;
  approved_at?: Date;
  shipped_at?: Date;
  total_amount?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Order Item Interface
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  created_at: Date;
}

/**
 * Invoice Interface
 */
export interface Invoice {
  id: string;
  order_id: string;
  institution_id: string;
  patient_id: string;
  invoice_number: string;
  invoice_year: number;
  total_amount: number;
  pdf_s3_key?: string;
  created_at: Date;
  invoice_date: Date;
}

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  patientId?: string; // For workers - their assigned patient
  iat?: number;
  exp?: number;
}

/**
 * Auth DTOs (Data Transfer Objects)
 */

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  institutionName: string;
  addressStreet: string;
  addressPlz: string;
  addressCity: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface WorkerLoginDto {
  username: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user?: UserResponse;
  accessToken?: string;
  refreshToken?: string;
  requiresEmailVerification?: boolean;
  email?: string;
  message?: string;
}

/**
 * API Response Interfaces
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Error Types
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Nicht autorisiert') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Zugriff verweigert') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource nicht gefunden') {
    super(404, message);
  }
}
