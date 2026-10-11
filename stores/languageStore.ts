import { setRequestLanguage, updateLanguage } from '@/app/services/api';
import i18n, { AppLanguage, getDeviceLanguage, isSupportedLanguage } from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'appLanguage';

interface LanguageState {
  language: AppLanguage;
  /** True once the user picked a language in Settings; until then we follow the phone language. */
  isManual: boolean;
  load: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  /** Re-read the phone language (Android doesn't restart the app when it changes). No-op once the user picked one. */
  syncWithDevice: () => void;
}

function apply(language: AppLanguage) {
  setRequestLanguage(language);
  if (i18n.language !== language) i18n.changeLanguage(language);
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getDeviceLanguage(),
  isManual: false,

  load: async () => {
    let stored: string | null = null;
    try {
      stored = await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      // fall back to the device language
    }
    const isManual = isSupportedLanguage(stored);
    const language = isManual ? stored as AppLanguage : getDeviceLanguage();
    apply(language);
    set({ language, isManual });
  },

  setLanguage: async (language) => {
    apply(language);
    set({ language, isManual: true });
    await AsyncStorage.setItem(STORAGE_KEY, language);
    if (useAuthStore.getState().user) {
      await updateLanguage(language).catch(() => {});
    }
  },

  syncWithDevice: () => {
    const { isManual, language } = get();
    if (isManual) return;
    const device = getDeviceLanguage();
    if (device === language) return;
    apply(device);
    set({ language: device });
    if (useAuthStore.getState().user) {
      updateLanguage(device).catch(() => {});
    }
  },
}));
