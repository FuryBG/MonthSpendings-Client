import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bg from './locales/bg';
import en from './locales/en';
import es from './locales/es';

export const SUPPORTED_LANGUAGES = ['en', 'bg', 'es'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Each language's name written in that language (shown in the language picker). */
export const LANGUAGE_NATIVE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  bg: 'Български',
  es: 'Español',
};

const LOCALE_TAGS: Record<AppLanguage, string> = {
  en: 'en-GB',
  bg: 'bg-BG',
  es: 'es-ES',
};

export function isSupportedLanguage(value: unknown): value is AppLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/** The phone's primary language if we support it, otherwise English. */
export function getDeviceLanguage(): AppLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return isSupportedLanguage(code) ? code : 'en';
}

/** BCP-47 tag for Intl / toLocale* formatting in the current app language. */
export function localeTag(language: string = i18n.language): string {
  return isSupportedLanguage(language) ? LOCALE_TAGS[language] : LOCALE_TAGS.en;
}

// eslint-disable-next-line import/no-named-as-default-member -- i18next instance API
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bg: { translation: bg },
    es: { translation: es },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
