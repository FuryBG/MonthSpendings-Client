import { getUser, setMemoryToken } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { AppUser, AuthResponse } from '@/types/Types';
import * as SecureStore from 'expo-secure-store';
import { NativeModules } from 'react-native';
import { create } from 'zustand';

function writeWalletToken(token: string) {
  NativeModules.WalletSync?.setToken(token).catch?.(() => {});
}

function deleteWalletToken() {
  NativeModules.WalletSync?.deleteToken().catch?.(() => {});
}

export { writeWalletToken };

interface AuthState {
  user: AppUser | null;
  userLoading: boolean;
  signIn: (tokens: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setProStatus: (isPro: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userLoading: true,

  signIn: async (tokens: AuthResponse) => {
    setMemoryToken(tokens.accessToken);
    await SecureStore.setItemAsync('token', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    writeWalletToken(tokens.accessToken);
    const user = await getUser();
    set({ user });
  },

  signOut: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        const { revokeToken } = await import('@/app/services/api');
        await revokeToken(refreshToken);
      }
    } catch {
      // best-effort revoke
    }
    setMemoryToken(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    deleteWalletToken();
    set({ user: null, userLoading: false });
    queryClient.clear();
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        setMemoryToken(token);
        writeWalletToken(token);
        const user = await getUser();
        set({ user, userLoading: false });
      } else {
        set({ user: null, userLoading: false });
      }
    } catch {
      // Only clear the user if tokens were actually deleted (genuine auth failure,
      // handled by the refresh interceptor). For transient errors (network down,
      // server 5xx), the token is still in SecureStore — keep it for the next launch.
      const tokenStillExists = await SecureStore.getItemAsync('token').catch(() => null);
      set({ user: null, userLoading: false });
      if (tokenStillExists) {
        // Token is valid but unreachable right now — restore memory token so the
        // AppState foreground listener's refreshUser() can recover without re-login.
        setMemoryToken(tokenStillExists);
      }
    }
  },

  refreshUser: async () => {
    try {
      const user = await getUser();
      set({ user });
    } catch {
      // silent — user state unchanged
    }
  },

  setProStatus: (isPro: boolean) => {
    set((state) => ({
      user: state.user ? { ...state.user, isPro } : null,
    }));
  },

  clearUser: () => {
    set({ user: null });
  },
}));
