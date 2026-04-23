export interface Role {
  id?: number;
  name?: string;
}

export interface User {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role?: Role;
  branchId?: number;
  enabled?: boolean;
}

export interface Brand {
  id?: number;
  name?: string;
  logoUrl?: string;
}

export interface Category {
  id?: number;
  name?: string;
  description?: string;
}

export interface Inventory {
  id?: number;
  branchId?: number;
  branchName?: string;
  quantity?: number;
}

export interface ProductVariant {
  id?: number;
  sku?: string;
  price?: number;
  color?: string;
  specsJson?: Record<string, any>;
  quantity?: number;
  inventories?: Inventory[];
  images?: ProductImage[];
}

export interface Product {
  id?: number;
  name?: string;
  description?: string;
  categoryName?: string;
  brandName?: string;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: number;
  imageUrl?: string;
  isPrimary?: boolean;
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
  productName?: string;
  variantColor?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface Order {
  id?: number;
  userId?: number;
  branchId?: number;
  status?: string;
  totalPrice?: number;
  discountAmount?: number;
  voucherCode?: string;
  createdAt?: string;
  items?: OrderItem[];
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RegisterRequest {
  fullName?: string;
  email: string;
  phone: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  username?: string;
  role?: string;
  user?: User; // kept for legacy compat if needed
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

export type PageUser = PageResponse<User>;
export type PageReview = PageResponse<Review>;
export type PageProduct = PageResponse<Product>;
export type PageOrder = PageResponse<Order>;
export type PageCategory = PageResponse<Category>;
export type PageBrand = PageResponse<Brand>;

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
  status?: "PENDING" | "APPROVED" | "CANCELLED" | "DELIVERED";
  userId?: number;
  branchId?: number;
}

export interface UserQueryParams extends QueryParams {
}

export interface ReviewQueryParams extends QueryParams {
}

export interface CategoryQueryParams extends QueryParams {
}

export interface BrandQueryParams extends QueryParams {
}

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
  items?: CartItem[];
  totalPrice?: number;
}

