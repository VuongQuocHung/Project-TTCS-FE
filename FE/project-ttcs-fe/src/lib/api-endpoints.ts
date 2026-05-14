import { apiClient } from "./api";
import type {
  AuthResponse,
  AdminUserRequest,
  Brand,
  PageBrand,
  PageCategory,
  PageOrder,
  PageProduct,
  PageUser,
  PageVoucher,
  QueryParams,
  BrandQueryParams,
  Branch,
  BranchFulfillment,
  Cart,
  CartCheckRequest,
  Category,
  CategoryQueryParams,
  ChangePasswordRequest,
  DashboardStats,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  LowStock,
  Order,
  OrderQueryParams,
  OrderRequest,
  PaymentMethod,
  PaymentResponse,
  AiChatRequest,
  AiChatResponse,
  Product,
  ProductImage,
  ProductQueryParams,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  Review,
  SessionUser,
  UpdateProfileRequest,
  User,
  Voucher,
  VerifyEmailRequest,
} from "@/types/api";

const toQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.POST<AuthResponse>("/api/v1/auth/login", data),
  register: (data: RegisterRequest) =>
    apiClient.POST<string>("/api/v1/auth/register", data),
  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.POST<string>("/api/v1/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.POST<string>("/api/v1/auth/reset-password", data),
  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.POST<string>("/api/v1/auth/verify-email", data),
  googleLogin: (data: GoogleLoginRequest) =>
    apiClient.POST<AuthResponse>("/api/v1/auth/google", data),
  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.POST<AuthResponse>("/api/v1/auth/refresh-token", data),
};

export const aiApi = {
  chat: (data: AiChatRequest) =>
    apiClient.POST<AiChatResponse>("/api/v1/public/ai/chat", data),
};

export const productApi = {
  getAll: (params?: ProductQueryParams) =>
    apiClient.GET<PageProduct>(`/api/v1/public/products${toQueryString(params)}`),
  getBestSelling: (limit = 4) =>
    apiClient.GET<Product[]>(`/api/v1/public/products/best-selling?limit=${limit}`),
  getById: (id: number) =>
    apiClient.GET<Product>(`/api/v1/public/products/${id}`),
  getAdminById: (id: number) =>
    apiClient.GET<Product>(`/api/v1/admin/products/${id}`, { auth: true }),
  getSuggestions: (q: string) =>
    apiClient.GET<string[]>(
      `/api/v1/public/products/suggestions?q=${encodeURIComponent(q)}`
    ),
  getAllAdmin: (params?: ProductQueryParams) =>
    apiClient.GET<PageProduct>(`/api/v1/admin/products${toQueryString(params)}`, {
      auth: true,
    }),
  create: (data: Product) =>
    apiClient.POST<Product>("/api/v1/admin/products", data, { auth: true }),
  update: (id: number, data: Product) =>
    apiClient.PUT<Product>(`/api/v1/admin/products/${id}`, data, {
      auth: true,
    }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/products/${id}`, { auth: true }),
  addVariantImage: (variantId: number, imageUrl: string) =>
    apiClient.POST<ProductImage>(
      `/api/v1/admin/products/variants/${variantId}/images?imageUrl=${encodeURIComponent(
        imageUrl
      )}`,
      undefined,
      { auth: true }
    ),
};

export const categoryApi = {
  getAllPublic: () =>
    apiClient.GET<Category[]>("/api/v1/public/catalog/categories"),
  getAdminById: (id: number) =>
    apiClient.GET<Category>(`/api/v1/admin/catalog/categories/${id}`, { auth: true }),
  getManagerById: (id: number) =>
    apiClient.GET<Category>(`/api/v1/manager/catalog/categories/${id}`, { auth: true }),
  getAll: (params?: CategoryQueryParams) =>
    apiClient.GET<PageCategory>(`/api/v1/admin/catalog/categories${toQueryString(params)}`, {
      auth: true,
    }),
  create: (data: Category) =>
    apiClient.POST<Category>("/api/v1/admin/catalog/categories", data, {
      auth: true,
    }),
  update: (id: number, data: Category) =>
    apiClient.PUT<Category>(`/api/v1/admin/catalog/categories/${id}`, data, {
      auth: true,
    }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/catalog/categories/${id}`, { auth: true }),
};

export const brandApi = {
  getAllPublic: () => apiClient.GET<Brand[]>("/api/v1/public/catalog/brands"),
  getAdminById: (id: number) =>
    apiClient.GET<Brand>(`/api/v1/admin/catalog/brands/${id}`, { auth: true }),
  getManagerById: (id: number) =>
    apiClient.GET<Brand>(`/api/v1/manager/catalog/brands/${id}`, { auth: true }),
  getAll: (params?: BrandQueryParams) =>
    apiClient.GET<PageBrand>(`/api/v1/admin/catalog/brands${toQueryString(params)}`, {
      auth: true,
    }),
  create: (data: Brand) =>
    apiClient.POST<Brand>("/api/v1/admin/catalog/brands", data, {
      auth: true,
    }),
  update: (id: number, data: Brand) =>
    apiClient.PUT<Brand>(`/api/v1/admin/catalog/brands/${id}`, data, {
      auth: true,
    }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/catalog/brands/${id}`, { auth: true }),
};

export const branchApi = {
  getAllPublic: () =>
    apiClient.GET<Branch[]>("/api/v1/public/catalog/branches"),
  checkAvailability: (data: CartCheckRequest) =>
    apiClient.POST<BranchFulfillment[]>(
      "/api/v1/public/catalog/branches/check-availability",
      data
    ),
  getAllAdmin: () =>
    apiClient.GET<Branch[]>("/api/v1/admin/branches", { auth: true }),
  getAdminById: (id: number) =>
    apiClient.GET<Branch>(`/api/v1/admin/branches/${id}`, { auth: true }),
  create: (data: Branch) =>
    apiClient.POST<Branch>("/api/v1/admin/branches", data, { auth: true }),
  update: (id: number, data: Branch) =>
    apiClient.PUT<Branch>(`/api/v1/admin/branches/${id}`, data, {
      auth: true,
    }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/branches/${id}`, { auth: true }),
  getBranchDashboard: (id: number, month?: string) =>
    apiClient.GET<DashboardStats>(
      `/api/v1/admin/branches/${id}/dashboard${toQueryString({ month })}`,
      { auth: true }
    ),
  getBranchLowStock: (id: number) =>
    apiClient.GET<LowStock[]>(`/api/v1/admin/branches/${id}/low-stock`, {
      auth: true,
    }),
};

export const orderApi = {
  create: (data: OrderRequest) =>
    apiClient.POST<Order>("/api/v1/me/orders", data, { auth: true }),
  getMyOrders: () => apiClient.GET<PageOrder>("/api/v1/me/orders", { auth: true }),
  getMyOrderById: (id: number) =>
    apiClient.GET<Order>(`/api/v1/me/orders/${id}`, { auth: true }),
  cancelMyOrder: (id: number) =>
    apiClient.PUT(`/api/v1/me/orders/${id}/cancel`, undefined, { auth: true }),
  getAllAdmin: (params?: OrderQueryParams) =>
    apiClient.GET<PageOrder>(`/api/v1/admin/orders${toQueryString(params)}`, {
      auth: true,
    }),
  getAdminById: (id: number) =>
    apiClient.GET<Order>(`/api/v1/admin/orders/${id}`, { auth: true }),
  getAllManager: (params?: OrderQueryParams) =>
    apiClient.GET<PageOrder>(`/api/v1/manager/orders${toQueryString(params)}`, {
      auth: true,
    }),
  getManagerById: (id: number) =>
    apiClient.GET<Order>(`/api/v1/manager/orders/${id}`, { auth: true }),
  updateStatus: (id: number, status: string) =>
    apiClient.PUT(
      `/api/v1/admin/orders/${id}/status?status=${encodeURIComponent(status)}`,
      undefined,
      { auth: true }
    ),
  updateManagerStatus: (id: number, status: string) =>
    apiClient.PUT(
      `/api/v1/manager/orders/${id}/status?status=${encodeURIComponent(status)}`,
      undefined,
      { auth: true }
    ),
  getDashboardStats: (month?: string) =>
    apiClient.GET<DashboardStats>(
      `/api/v1/admin/orders/dashboard/stats${toQueryString({ month })}`,
      { auth: true }
    ),
};

export const managerDashboardApi = {
  getStats: (month?: string) =>
    apiClient.GET<DashboardStats>(
      `/api/v1/manager/dashboard/stats${toQueryString({ month })}`,
      { auth: true }
    ),
  getLowStock: () =>
    apiClient.GET<LowStock[]>("/api/v1/manager/dashboard/low-stock", {
      auth: true,
    }),
  updateInventory: (variantId: number, quantity: number) =>
    apiClient.PUT(
      `/api/v1/manager/inventory/${variantId}?quantity=${quantity}`,
      undefined,
      { auth: true }
    ),
};

export const paymentApi = {
  createPaymentUrl: (orderId: number, method: PaymentMethod) =>
    apiClient.GET<PaymentResponse>(
      `/api/v1/payments/create-url/${orderId}?method=${encodeURIComponent(method)}`,
      { auth: true }
    ),
};

export const voucherApi = {
  getMine: () => apiClient.GET<Voucher[]>("/api/v1/me/vouchers", { auth: true }),
  validate: (code: string, orderValue: number) =>
    apiClient.GET<Voucher>(
      `/api/v1/public/vouchers/validate?code=${encodeURIComponent(code)}&orderValue=${orderValue}`
    ),
  getAllAdmin: (params?: { page?: number; size?: number }) =>
    apiClient.GET<PageVoucher>(`/api/v1/admin/vouchers${toQueryString(params)}`, {
      auth: true,
    }),
  getAllManager: (params?: { page?: number; size?: number }) =>
    apiClient.GET<PageVoucher>(`/api/v1/manager/vouchers${toQueryString(params)}`, {
      auth: true,
    }),
  getAdminById: (id: number) =>
    apiClient.GET<Voucher>(`/api/v1/admin/vouchers/${id}`, { auth: true }),
  getManagerById: (id: number) =>
    apiClient.GET<Voucher>(`/api/v1/manager/vouchers/${id}`, { auth: true }),
  create: (data: Voucher) =>
    apiClient.POST<Voucher>("/api/v1/admin/vouchers", data, { auth: true }),
  createManager: (data: Voucher) =>
    apiClient.POST<Voucher>("/api/v1/manager/vouchers", data, { auth: true }),
  update: (id: number, data: Voucher) =>
    apiClient.PUT<Voucher>(`/api/v1/admin/vouchers/${id}`, data, { auth: true }),
  updateManager: (id: number, data: Voucher) =>
    apiClient.PUT<Voucher>(`/api/v1/manager/vouchers/${id}`, data, { auth: true }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/vouchers/${id}`, { auth: true }),
  deleteManager: (id: number) =>
    apiClient.DELETE(`/api/v1/manager/vouchers/${id}`, { auth: true }),
};

export const reviewApi = {
  getProductReviews: (productId: number) =>
    apiClient.GET<Review[]>(`/api/v1/public/reviews/product/${productId}`),
  create: (data: Review) =>
    apiClient.POST<Review>("/api/v1/me/reviews", data, { auth: true }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/me/reviews/${id}`, { auth: true }),
};

export const userApi = {
  getAll: (params?: QueryParams) =>
    apiClient.GET<PageUser>(`/api/v1/admin/users${toQueryString(params)}`, { auth: true }),
  getById: (id: number) =>
    apiClient.GET<User>(`/api/v1/admin/users/${id}`, { auth: true }),
  getManagerById: (id: number) =>
    apiClient.GET<User>(`/api/v1/manager/users/${id}`, { auth: true }),
  create: (data: AdminUserRequest) =>
    apiClient.POST<User>("/api/v1/admin/users", data, { auth: true }),
  update: (id: number, data: AdminUserRequest) =>
    apiClient.PUT<User>(`/api/v1/admin/users/${id}`, data, { auth: true }),
  delete: (id: number) =>
    apiClient.DELETE(`/api/v1/admin/users/${id}`, { auth: true }),
  assignBranch: (userId: number, branchId: number) =>
    apiClient.POST<User>(
      `/api/v1/admin/users/${userId}/assign-branch/${branchId}`,
      undefined,
      { auth: true }
    ),
  toggleStatus: (userId: number, enabled: boolean) =>
    apiClient.PUT(
      `/api/v1/admin/users/${userId}/status?enabled=${String(enabled)}`,
      undefined,
      { auth: true }
    ),
  updateRole: (userId: number, role: string) =>
    apiClient.PUT(
      `/api/v1/admin/users/${userId}/role?role=${encodeURIComponent(role)}`,
      undefined,
      { auth: true }
    ),
};

export const profileApi = {
  getProfile: () =>
    apiClient.GET<SessionUser>("/api/v1/me/profile", { auth: true }),
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.PUT<SessionUser>("/api/v1/me/profile", data, { auth: true }),
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.PUT<string>("/api/v1/me/profile/password", data, { auth: true }),
};

export const cartApi = {
  getCart: () => apiClient.GET<Cart>("/api/v1/me/cart", { auth: true }),
  addToCart: (variantId: number, quantity = 1) =>
    apiClient.POST<Cart>(
      `/api/v1/me/cart?variantId=${variantId}&quantity=${quantity}`,
      undefined,
      { auth: true }
    ),
  updateQuantity: (id: number, quantity: number) =>
    apiClient.PUT<Cart>(`/api/v1/me/cart/items/${id}?quantity=${quantity}`, undefined, {
      auth: true,
    }),
  removeFromCart: (id: number) =>
    apiClient.DELETE<Cart>(`/api/v1/me/cart/items/${id}`, { auth: true }),
  clearCart: () => apiClient.DELETE("/api/v1/me/cart", { auth: true }),
};

export const fileApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    return apiClient
      .POST<Array<{ url: string; fileName: string }>>(
        "/api/v1/admin/products/upload-image",
        formData,
        { auth: true }
      )
      .then((results) => results[0]);
  },
  uploadMany: (files: File[] | FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    return apiClient.POST<Array<{ url: string; fileName: string }>>(
      "/api/v1/admin/products/upload-image",
      formData,
      { auth: true }
    );
  },
};
