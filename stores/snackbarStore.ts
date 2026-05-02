import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  type: 'error' | 'success';
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  hide: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  type: 'error',
  showError:   (message) => set({ visible: true, message, type: 'error' }),
  showSuccess: (message) => set({ visible: true, message, type: 'success' }),
  hide: () => set({ visible: false }),
}));
