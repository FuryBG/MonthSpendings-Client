import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface OrderState {
  categoryOrders: Record<number, number[]>;
  loadOrders: (userId: number, budgetIds: number[]) => Promise<void>;
  setCategoryOrder: (userId: number, budgetId: number, ids: number[]) => Promise<void>;
  persistCategoryOrder: (userId: number, budgetId: number, ids: number[]) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  categoryOrders: {},

  loadOrders: async (userId, budgetIds) => {
    const categoryOrders: Record<number, number[]> = {};
    await Promise.all(
      budgetIds.map(async (budgetId) => {
        const raw = await AsyncStorage.getItem(`order_cats_${userId}_${budgetId}`);
        if (raw) categoryOrders[budgetId] = JSON.parse(raw);
      })
    );
    set({ categoryOrders });
  },

  setCategoryOrder: async (userId, budgetId, ids) => {
    set((s) => ({ categoryOrders: { ...s.categoryOrders, [budgetId]: ids } }));
    await AsyncStorage.setItem(`order_cats_${userId}_${budgetId}`, JSON.stringify(ids));
  },

  persistCategoryOrder: async (userId, budgetId, ids) => {
    await AsyncStorage.setItem(`order_cats_${userId}_${budgetId}`, JSON.stringify(ids));
  },
}));

export function applyOrder<T extends { id: number }>(items: T[], savedOrder: number[]): T[] {
  if (!savedOrder.length) return items;
  const map = new Map(items.map((item) => [item.id, item]));
  const ordered = savedOrder.filter((id) => map.has(id)).map((id) => map.get(id)!);
  const newItems = items.filter((item) => !savedOrder.includes(item.id));
  return [...ordered, ...newItems];
}
