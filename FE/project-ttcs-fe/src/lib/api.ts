export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const DEFAULT_BASE_URL = "http://localhost:8080";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return envUrl && envUrl.trim().length > 0 ? envUrl : DEFAULT_BASE_URL;
}

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth.token");
}

export function writeAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem("auth.token");
    return;
  }
  localStorage.setItem("auth.token", token);
}

async function safeParseJson(text: string): Promise<unknown> {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`;

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options?.auth) {
    const token = readAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? await safeParseJson(text) : null;

  if (!res.ok) {
    const fieldErrors =
      typeof data === "object" && data && "fieldErrors" in data
        ? ((data as any).fieldErrors as Record<string, unknown>)
        : null;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).find((v) => typeof v === "string" && v.trim().length > 0)
      : null;

    const message =
      (typeof firstFieldError === "string" && firstFieldError) ||
      (typeof data === "object" && data && "message" in data && (data as any).message) ||
      res.statusText ||
      "Request failed";

    const error: ApiError = {
      status: res.status,
      message: String(message),
      details: data,
    };

    throw error;
  }

  return data as T;
}

export type AuthResponse = {
  token: string;
  tokenType: string;
  email: string;
  fullName: string;
  role: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ProductImage = {
  id: number;
  imageUrl: string;
  isPrimary?: boolean | null;
};

export type ProductSpecification = {
  cpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  vga?: string | null;
  screen?: string | null;
  os?: string | null;
  battery?: string | null;
  weight?: string | null;
};

export type Product = {
  id: number;
  name: string;
  price: number; // BigDecimal serialized as number or string; normalize at runtime
  stock?: number;
  description?: string | null;
  images?: ProductImage[];
  specification?: ProductSpecification | null;
};

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products", { method: "GET" });
}
