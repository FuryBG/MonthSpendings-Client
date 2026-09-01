import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const TOUR_SEEN_KEY = 'tour_hasSeenTour';
const SCREENS_SEEN_KEY = 'tour_seenScreens';

interface TourState {
  hasSeenTour: boolean;
  seenScreens: string[];
  isActive: boolean;
  stepIndex: number;
  load: () => Promise<void>;
  startTour: () => void;
  nextStep: () => void;
  endTour: () => void;
  resetTour: () => Promise<void>;
  markScreenSeen: (screen: string) => Promise<void>;
  hasSeenScreen: (screen: string) => boolean;
}

export const useTourStore = create<TourState>((set, get) => ({
  hasSeenTour: false,
  seenScreens: [],
  isActive: false,
  stepIndex: 0,

  load: async () => {
    const [seen, screensJson] = await Promise.all([
      AsyncStorage.getItem(TOUR_SEEN_KEY),
      AsyncStorage.getItem(SCREENS_SEEN_KEY),
    ]);
    set({
      hasSeenTour: seen === '1',
      seenScreens: screensJson ? JSON.parse(screensJson) : [],
    });
  },

  startTour: () => set({ isActive: true, stepIndex: 0 }),

  nextStep: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),

  endTour: () => {
    set({ isActive: false, stepIndex: 0, hasSeenTour: true });
    AsyncStorage.setItem(TOUR_SEEN_KEY, '1');
  },

  resetTour: async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOUR_SEEN_KEY),
      AsyncStorage.removeItem(SCREENS_SEEN_KEY),
    ]);
    set({ hasSeenTour: false, seenScreens: [], isActive: false, stepIndex: 0 });
  },

  markScreenSeen: async (screen: string) => {
    const current = get().seenScreens;
    if (current.includes(screen)) return;
    const updated = [...current, screen];
    await AsyncStorage.setItem(SCREENS_SEEN_KEY, JSON.stringify(updated));
    set({ seenScreens: updated });
  },

  hasSeenScreen: (screen: string) => get().seenScreens.includes(screen),
}));
