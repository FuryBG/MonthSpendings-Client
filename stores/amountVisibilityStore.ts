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
    await AsyncStorage.setItem('amountsHidden', next ? '1' : '0');
    set({ hidden: next });
  },

  loadHidden: async () => {
    const v = await AsyncStorage.getItem('amountsHidden');
    if (v != null) {
      set({ hidden: v === '1' });
    }
  },
}));
