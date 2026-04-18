import { apiClient } from "./api";
import {
  AuthResponse,
  LoginRequest,
  GoogleLoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  Product,
  PageProduct,
  Category,
  PageCategory,
  Brand,
  PageBrand,
  Order,
  PageOrder,
  Review,
  PageReview,
  User,
  PageUser,
  Role,
  ProductQueryParams,
  CategoryQueryParams,
  BrandQueryParams,
  OrderQueryParams,
  ReviewQueryParams,
  UserQueryParams,
} from "@/types/api";

/**
 * Helper to convert a plain object into a query string.
 * Handles arrays by repeating the key (e.g. cpu=i5&cpu=i7)
 */
const toQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

// --- API Endpoints ---

export const authApi = {
  login: (data: LoginRequest) => apiClient.POST<AuthResponse>("/api/auth/login", data),
  googleLogin: (data: GoogleLoginRequest) => apiClient.POST<AuthResponse>("/api/auth/google", data),
  register: (data: RegisterRequest) => apiClient.POST<AuthResponse>("/api/auth/register", data),
  logout: () => apiClient.POST<string>("/api/auth/logout"),
  forgotPassword: (data: ForgotPasswordRequest) => apiClient.POST<string>("/api/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordRequest) => apiClient.POST<string>("/api/auth/reset-password", data),
  changePassword: (data: ChangePasswordRequest) => apiClient.POST<string>("/api/auth/change-password", data, { auth: true }),
};

export const productApi = {
  getAll: (params?: ProductQueryParams) => apiClient.GET<PageProduct>(`/api/products${toQueryString(params)}`),
  getById: (id: number) => apiClient.GET<Product>(`/api/products/${id}`),
  create: (data: Product) => apiClient.POST<Product>("/api/products", data, { auth: true }),
  update: (id: number, data: Product) => apiClient.PUT<Product>(`/api/products/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/products/${id}`, { auth: true }),
};

export const categoryApi = {
  getAll: (params?: CategoryQueryParams) => apiClient.GET<PageCategory>(`/api/categories${toQueryString(params)}`),
  getById: (id: number) => apiClient.GET<Category>(`/api/categories/${id}`),
  create: (data: Category) => apiClient.POST<Category>("/api/categories", data, { auth: true }),
  update: (id: number, data: Category) => apiClient.PUT<Category>(`/api/categories/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/categories/${id}`, { auth: true }),
};

export const brandApi = {
  getAll: (params?: BrandQueryParams) => apiClient.GET<PageBrand>(`/api/brands${toQueryString(params)}`),
  getById: (id: number) => apiClient.GET<Brand>(`/api/brands/${id}`),
  create: (data: Brand) => apiClient.POST<Brand>("/api/brands", data, { auth: true }),
  update: (id: number, data: Brand) => apiClient.PUT<Brand>(`/api/brands/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/brands/${id}`, { auth: true }),
};

export const orderApi = {
  getAll: (params?: OrderQueryParams) => apiClient.GET<PageOrder>(`/api/orders${toQueryString(params)}`, { auth: true }),
  getById: (id: number) => apiClient.GET<Order>(`/api/orders/${id}`, { auth: true }),
  create: (data: Order) => apiClient.POST<Order>("/api/orders", data, { auth: true }),
  updateStatus: (id: number, status: string) => apiClient.PUT<Order>(`/api/orders/${id}/status?status=${status}`, null, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/orders/${id}`, { auth: true }),
};

export const reviewApi = {
  getAll: (params?: ReviewQueryParams) => apiClient.GET<PageReview>(`/api/reviews${toQueryString(params)}`),
  getById: (id: number) => apiClient.GET<Review>(`/api/reviews/${id}`),
  create: (data: Review) => apiClient.POST<Review>("/api/reviews", data, { auth: true }),
  update: (id: number, data: Review) => apiClient.PUT<Review>(`/api/reviews/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/reviews/${id}`, { auth: true }),
};

export const userApi = {
  getAll: (params?: UserQueryParams) => apiClient.GET<PageUser>(`/api/users${toQueryString(params)}`, { auth: true }),
  getById: (id: number) => apiClient.GET<User>(`/api/users/${id}`, { auth: true }),
  create: (data: User) => apiClient.POST<User>("/api/users", data, { auth: true }),
  update: (id: number, data: User) => apiClient.PUT<User>(`/api/users/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/users/${id}`, { auth: true }),
};

export const roleApi = {
  getAll: () => apiClient.GET<Role[]>("/api/roles", { auth: true }),
  getById: (id: number) => apiClient.GET<Role>(`/api/roles/${id}`, { auth: true }),
  create: (data: Role) => apiClient.POST<Role>("/api/roles", data, { auth: true }),
  update: (id: number, data: Role) => apiClient.PUT<Role>(`/api/roles/${id}`, data, { auth: true }),
  delete: (id: number) => apiClient.DELETE(`/api/roles/${id}`, { auth: true }),
};

export const fileApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.POST<{ url: string }>("/api/files/upload", formData, { auth: true });
  },
};
