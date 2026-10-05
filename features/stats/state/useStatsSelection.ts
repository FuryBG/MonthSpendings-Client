import { create } from 'zustand';
import { DEFAULT_SELECTION } from '../model/ranges';
import type { RangeSelection } from '../model/types';

type StatsSelectionState = {
  budgetId: number | null;
  /** The range all metrics are shown for. */
  selectionA: RangeSelection;
  /** Optional comparison range; null = compare mode off. */
  selectionB: RangeSelection | null;
  /** Bumped on reset; the screen uses it as a key so all local UI state starts fresh too. */
  sessionKey: number;

  /** Resets the selection when the user switches budget (period ids are budget-specific). */
  syncBudget: (budgetId: number | null) => void;
  setA: (selection: RangeSelection) => void;
  setB: (selection: RangeSelection | null) => void;
  /** Back to "This period", no comparison, fresh screen. */
  reset: () => void;
};

// Session-only on purpose: opening the app always starts at "This period".
export const useStatsSelection = create<StatsSelectionState>((set, get) => ({
  budgetId: null,
  selectionA: DEFAULT_SELECTION,
  selectionB: null,
  sessionKey: 0,

  syncBudget: (budgetId) => {
    if (get().budgetId === budgetId) return;
    set({ budgetId, selectionA: DEFAULT_SELECTION, selectionB: null });
  },
  setA: (selection) => set({ selectionA: selection }),
  setB: (selection) => set({ selectionB: selection }),
  reset: () => set(s => ({ selectionA: DEFAULT_SELECTION, selectionB: null, sessionKey: s.sessionKey + 1 })),
}));
