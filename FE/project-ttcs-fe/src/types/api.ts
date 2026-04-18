export interface Role {
  id?: number;
  name?: string;
}

export interface User {
  id?: number;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: Role;
  createdAt?: string;
  resetToken?: string;
  resetTokenExpiry?: string;
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

export interface Product {
  id?: number;
  name?: string;
  price?: number;
  importPrice?: number;
  stock?: number;
  description?: string;
  brand?: Brand;
  category?: Category;
  images?: ProductImage[];
  specification?: ProductSpecification;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: number;
  imageUrl?: string;
  isPrimary?: boolean;
}

export interface ProductSpecification {
  id?: number;
  cpu?: string;
  ram?: string;
  storage?: string;
  vga?: string;
  screen?: string;
  os?: string;
  battery?: string;
  weight?: string;
}

export interface Review {
  id?: number;
  product?: Product;
  user?: User;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export interface Order {
  id?: number;
  user?: User;
  orderDate?: string;
  status?: "PENDING" | "APPROVED" | "CANCELLED" | "DELIVERED";
  totalAmount?: number;
  shippingAddress?: string;
  phoneNumber?: string;
  orderDetails?: OrderDetail[];
  updatedAt?: string;
}

export interface OrderDetail {
  id?: number;
  product?: Product;
  quantity?: number;
  unitPrice?: number;
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
}

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  email?: string;
  fullName?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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

export interface PageUser {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: User[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageReview {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: Review[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageProduct {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: Product[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageOrder {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: Order[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageCategory {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: Category[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface PageBrand {
  totalElements?: number;
  totalPages?: number;
  pageable?: PageableObject;
  size?: number;
  content?: Brand[];
  number?: number;
  sort?: SortObject;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  [key: string]: unknown;
}

export interface ProductQueryParams extends QueryParams {
  name?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  cpu?: string[];
  ram?: string[];
  storage?: string[];
  vga?: string[];
  screen?: string[];
}

export interface OrderQueryParams extends QueryParams {
  status?: "PENDING" | "APPROVED" | "CANCELLED" | "DELIVERED";
  userId?: number;
  phoneNumber?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface UserQueryParams extends QueryParams {
  email?: string;
  fullName?: string;
  phone?: string;
  roleId?: number;
}

export interface ReviewQueryParams extends QueryParams {
  productId?: number;
  userId?: number;
  rating?: number;
}

export interface CategoryQueryParams extends QueryParams {
  name?: string;
}

export interface BrandQueryParams extends QueryParams {
  name?: string;
}
