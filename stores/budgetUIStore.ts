import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface BudgetUIState {
  selectedMainBudgetId: number | null;
  setMainBudget: (id: number) => Promise<void>;
  loadMainBudgetId: () => Promise<void>;
}

export const useBudgetUIStore = create<BudgetUIState>((set) => ({
  selectedMainBudgetId: null,

  setMainBudget: async (id: number) => {
    await AsyncStorage.setItem('mainBudgetId', id.toString());
    set({ selectedMainBudgetId: id });
  },

  loadMainBudgetId: async () => {
    const id = await AsyncStorage.getItem('mainBudgetId');
    if (id != null) {
      set({ selectedMainBudgetId: Number(id) });
    }
  },
}));
