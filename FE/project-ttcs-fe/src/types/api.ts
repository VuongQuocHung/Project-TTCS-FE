export type Role = "GUEST" | "CUSTOMER" | "MANAGER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "STRIPE";

export type FulfillmentStatus =
  | "FULLY_AVAILABLE"
  | "PARTIALLY_AVAILABLE"
  | "UNAVAILABLE";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export type VoucherStatus = "ACTIVE" | "INACTIVE" | "EXPIRED" | "EXHAUSTED";

export interface User {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role?: Role | string;
  branchId?: number;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserRequest {
  username: string;
  email: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role?: Role | string;
  branchId?: number | null;
  enabled?: boolean;
}

export interface SessionUser extends User {
  token?: string;
  refreshToken?: string;
}

export interface Brand {
  id?: number;
  name?: string;
  logo?: string;
  description?: string;
}

export interface Category {
  id?: number;
  name?: string;
  description?: string;
}

export interface Branch {
  id?: number;
  name?: string;
  address?: string;
  phone?: string;
}

export interface Inventory {
  branchId?: number;
  branchName?: string;
  quantity?: number;
}

export interface ProductImage {
  id?: number;
  imageUrl?: string;
}

export interface ProductVariant {
  id?: number;
  sku?: string;
  price?: number;
  color?: string;
  specsJson?: Record<string, unknown>;
  quantity?: number;
  inventories?: Inventory[];
  images?: ProductImage[];
}

export interface Product {
  id?: number;
  name?: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  variants?: ProductVariant[];
}

export interface Review {
  id?: number;
  productId?: number;
  username?: string;
  fullName?: string;
  rating?: number;
  content?: string;
  createdAt?: string;
}

export interface OrderItem {
  id?: number;
  variantId?: number;
  productName?: string;
  sku?: string;
  quantity?: number;
  price?: number;
}

export interface Order {
  id?: number;
  userId?: number;
  branchId?: number;
  status?: OrderStatus | string;
  totalPrice?: number;
  discountAmount?: number;
  voucherCode?: string;
  createdAt?: string;
  items?: OrderItem[];
}

export interface Voucher {
  id?: number;
  code?: string;
  discountType?: DiscountType | string;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscountValue?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  status?: VoucherStatus | string;
  targetUserId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  username?: string;
  role?: Role | string;
  user?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface SortObject {
  sorted?: boolean;
  empty?: boolean;
  unsorted?: boolean;
}

export interface PageableObject {
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  offset?: number;
  sort?: SortObject;
  unpaged?: boolean;
}

export interface PageResponse<T> {
  content?: T[];
  pageNo?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
}

export type PageReview = PageResponse<Review>;
export type PageProduct = PageResponse<Product>;
export type PageOrder = PageResponse<Order>;
export type PageCategory = PageResponse<Category>;
export type PageBrand = PageResponse<Brand>;
export type PageVoucher = PageResponse<Voucher>;

export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  [key: string]: unknown;
}

export interface ProductQueryParams extends QueryParams {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  cpu?: string;
  ram?: string;
  storage?: string;
}

export interface OrderQueryParams extends QueryParams {
  status?: OrderStatus;
  userId?: number;
  branchId?: number;
}

export type CategoryQueryParams = QueryParams;

export type BrandQueryParams = QueryParams;

export interface CartItem {
  id?: number;
  variantId?: number;
  productName?: string;
  variantSku?: string;
  quantity?: number;
  price?: number;
  snapshotPrice?: number;
}

export interface Cart {
  id?: number;
  items?: CartItem[];
  totalPrice?: number;
}

export interface OrderItemRequest {
  variantId: number;
  quantity: number;
}

export interface OrderRequest {
  branchId: number;
  items: OrderItemRequest[];
  voucherCode?: string;
  paymentMethod?: PaymentMethod;
}

export interface CartCheckRequest {
  items: Array<{
    variantId: number;
    quantity: number;
  }>;
}

export interface ItemFulfillment {
  variantId?: number;
  requestedQuantity?: number;
  availableQuantity?: number;
  isAvailable?: boolean;
}

export interface BranchFulfillment extends Branch {
  branchId?: number;
  branchName?: string;
  status?: FulfillmentStatus | string;
  items?: ItemFulfillment[];
}

export interface DashboardStats {
  totalOrders?: number;
  totalRevenue?: number;
  successfulOrders?: number;
  revenueByStatus?: Record<string, number>;
}

export interface LowStock {
  branchId?: number;
  branchName?: string;
  variantId?: number;
  sku?: string;
  productName?: string;
  quantity?: number;
}
