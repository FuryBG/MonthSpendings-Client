import { getUser, setMemoryToken } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { AppUser } from '@/types/Types';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

const WALLET_TOKEN_FILE = FileSystem.documentDirectory + 'wallet_token';

function writeWalletToken(token: string) {
  if (Platform.OS !== 'android') return;
  FileSystem.writeAsStringAsync(WALLET_TOKEN_FILE, token).catch(() => {});
}

function deleteWalletToken() {
  if (Platform.OS !== 'android') return;
  FileSystem.deleteAsync(WALLET_TOKEN_FILE, { idempotent: true }).catch(() => {});
}

interface AuthState {
  user: AppUser | null;
  userLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setProStatus: (isPro: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userLoading: true,

  signIn: async (token: string) => {
    setMemoryToken(token);
    await SecureStore.setItemAsync('token', token);
    writeWalletToken(token);
    const user = await getUser();
    set({ user });
  },

  signOut: async () => {
    setMemoryToken(null);
    await SecureStore.deleteItemAsync('token');
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
      set({ user: null, userLoading: false });
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
