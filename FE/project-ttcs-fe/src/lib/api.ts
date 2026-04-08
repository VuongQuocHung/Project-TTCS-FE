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
        ? ((data as any).fieldErrors as Record<string, unknown>)
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
