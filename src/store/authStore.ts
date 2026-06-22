import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { type User, type Tokens, refresh as apiRefresh, getMe } from "@/api/auth";
import { registerRefresh } from "@/api/client";

const ACCESS_KEY = "alumieye_access_token";
const REFRESH_KEY = "alumieye_refresh_token";
const USER_KEY = "alumieye_user";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isReady: boolean;
  setAuth: (user: User, tokens: Tokens) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
  getAccessToken: () => string | null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isReady: false,

  setAuth: async (user, tokens) => {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.access_token);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    let user: User | null = userJson ? JSON.parse(userJson) : null;

    // Fetch fresh profile if we have a token but no cached user
    if (accessToken && !user) {
      try {
        const res = await getMe(accessToken);
        user = res.user;
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } catch {}
    }

    set({ accessToken, refreshToken, user, isReady: true });
  },

  getAccessToken: () => get().accessToken,
}));

registerRefresh(async () => {
  const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();
  if (!refreshToken) {
    await clearAuth();
    return null;
  }
  try {
    const res = await apiRefresh(refreshToken);
    await setAuth(res.user, res.tokens);
    return res.tokens.access_token;
  } catch {
    await clearAuth();
    return null;
  }
});
