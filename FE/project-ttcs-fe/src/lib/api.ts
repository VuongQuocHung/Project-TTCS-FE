export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const DEFAULT_BASE_URL = "http://localhost:8080";

function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  return envUrl && envUrl.trim().length > 0 ? envUrl : DEFAULT_BASE_URL; 
  // Nếu có env → dùng env
  // Không → dùng localhost
}

const TOKEN_KEYS = ["token", "accessToken", "access_token", "jwt", "jwtToken"] as const;

function normalizeToken(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.toLowerCase().startsWith("bearer ") ? trimmed.slice(7).trim() : trimmed;
}

function readTokenFromRecord(record: Record<string, unknown>): string | null {
  for (const key of TOKEN_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return normalizeToken(value);
    }
  }
  return null;
}

export function resolveTokenFromAuthPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const directToken = readTokenFromRecord(record);
  if (directToken) return directToken;

  const nestedCandidates = [record.data, record.auth, record.user];
  for (const candidate of nestedCandidates) {
    if (candidate && typeof candidate === "object") {
      const nestedToken = readTokenFromRecord(candidate as Record<string, unknown>);
      if (nestedToken) return nestedToken;
    }
  }

  return null;
}

// ─── Module-level in-memory token ───────────────────────────────────────────
// AuthContext gọi setMemoryToken() sau mỗi login/logout/hydration.
// readAuthToken() ưu tiên biến này để tránh race condition với localStorage.
let _memoryToken: string | null = null;

export function setMemoryToken(token: string | null): void {
  _memoryToken = token ? normalizeToken(token) : null;
}

function readAuthToken(): string | null {
  // 1. Ưu tiên in-memory (luôn đồng bộ, không có timing issue)
  if (_memoryToken && _memoryToken.trim().length > 0) return _memoryToken;

  // 2. Fallback: localStorage (cho trường hợp page reload trước khi AuthContext set)
  if (typeof window === "undefined") return null;

  const direct = localStorage.getItem("auth.token");
  if (direct && direct.trim().length > 0) {
    _memoryToken = normalizeToken(direct); // sync vào memory
    return _memoryToken;
  }

  // 3. Backward-compat: đọc từ auth.user nếu auth.token chưa được ghi
  const savedUser = localStorage.getItem("auth.user");
  if (!savedUser) return null;

  try {
    const parsed = JSON.parse(savedUser) as unknown;
    const fallbackToken = resolveTokenFromAuthPayload(parsed);
    if (fallbackToken) {
      _memoryToken = fallbackToken;
      localStorage.setItem("auth.token", fallbackToken);
      return fallbackToken;
    }
  } catch {
    // bỏ qua lỗi parse
  }

  return null;
}

export function writeAuthToken(token: string | null): void {
  const normalized = token ? normalizeToken(token) : null;
  _memoryToken = normalized; // luôn cập nhật memory trước
  if (typeof window === "undefined") return;
  if (normalized) {
    localStorage.setItem("auth.token", normalized);
  } else {
    localStorage.removeItem("auth.token");
  }
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
  if (!headers.has("Content-Type") && options?.body && !(options.body instanceof FormData)) {
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
        ? (data as { fieldErrors?: Record<string, unknown> }).fieldErrors
        : null;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).find((v) => typeof v === "string" && v.trim().length > 0)
      : null;

    const message =
      (typeof firstFieldError === "string" && firstFieldError) ||
      (typeof data === "object" && data !== null && "message" in data && typeof (data as Record<string, unknown>).message === "string" ? (data as Record<string, string>).message : null) ||
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

export const apiClient = {
  GET: <T>(url: string, options?: RequestInit & { auth?: boolean }) =>
    apiFetch<T>(url, { ...options, method: "GET" }),
  POST: <T>(url: string, body?: unknown, options?: RequestInit & { auth?: boolean }) =>
    apiFetch<T>(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),
  PUT: <T>(url: string, body?: unknown, options?: RequestInit & { auth?: boolean }) =>
    apiFetch<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  DELETE: <T>(url: string, options?: RequestInit & { auth?: boolean }) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
};
