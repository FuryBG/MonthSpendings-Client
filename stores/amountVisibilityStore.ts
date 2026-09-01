import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AmountVisibilityState {
  hidden: boolean;
  toggleHidden: () => Promise<void>;
  loadHidden: () => Promise<void>;
}

export const useAmountVisibilityStore = create<AmountVisibilityState>((set, get) => ({
  hidden: false,

  toggleHidden: async () => {
    const next = !get().hidden;
    set({ hidden: next });
    await AsyncStorage.setItem('amountsHidden', next ? '1' : '0');
  },

  loadHidden: async () => {
    const v = await AsyncStorage.getItem('amountsHidden');
    if (v != null) {
      set({ hidden: v === '1' });
    }
  },
}));
