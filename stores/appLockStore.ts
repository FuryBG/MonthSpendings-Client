import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AppLockState {
  lockEnabled: boolean;
  setLockEnabled: (v: boolean) => Promise<void>;
  load: () => Promise<void>;
}

export const useAppLockStore = create<AppLockState>((set) => ({
  lockEnabled: false,

  setLockEnabled: async (v) => {
    set({ lockEnabled: v });
    await AsyncStorage.setItem('appLockEnabled', v ? '1' : '0');
  },

  load: async () => {
    const v = await AsyncStorage.getItem('appLockEnabled');
    set({ lockEnabled: v === '1' });
  },
}));
