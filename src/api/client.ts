import { Platform } from "react-native";

function resolveApiBase(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL}/api/v1`;
  }
  // Dev auto-detect: Android emulator routes to host via 10.0.2.2, iOS Simulator uses localhost
  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${host}:8080/api/v1`;
}

const API_BASE = resolveApiBase();

export type ApiError = {
  error: { code: string; message: string };
};

type RefreshFn = () => Promise<string | null>;
let _onRefresh: RefreshFn | null = null;
let _refreshPromise: Promise<string | null> | null = null;

export function registerRefresh(fn: RefreshFn) {
  _onRefresh = fn;
}

async function doRequest(
  path: string,
  init: RequestInit,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const { accessToken, ...init } = options;

  let res = await doRequest(path, init, accessToken);

  if (res.status === 401 && accessToken && _onRefresh) {
    if (!_refreshPromise) {
      _refreshPromise = _onRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    const newToken = await _refreshPromise;
    if (newToken) {
      res = await doRequest(path, init, newToken);
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(
      (data as ApiError)?.error?.message ?? res.statusText
    ) as Error & { status: number; code?: string };
    err.status = res.status;
    err.code = (data as ApiError)?.error?.code;
    throw err;
  }

  return data as T;
}
