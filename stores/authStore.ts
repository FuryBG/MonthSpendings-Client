import { getUser } from '@/app/services/api';
import { queryClient } from '@/lib/queryClient';
import { AppUser } from '@/types/Types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
  user: AppUser | null;
  userLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userLoading: true,

  signIn: async (token: string) => {
    await SecureStore.setItemAsync('token', token);
    const user = await getUser();
    set({ user });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null });
    queryClient.clear();
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const user = await getUser();
        set({ user, userLoading: false });
      } else {
        set({ user: null, userLoading: false });
      }
    } catch {
      set({ user: null, userLoading: false });
    }
  },

  clearUser: () => {
    set({ user: null });
  },
}));
