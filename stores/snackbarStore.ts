import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  showError: (message: string) => void;
  hide: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  showError: (message: string) => set({ visible: true, message }),
  hide: () => set({ visible: false }),
}));
