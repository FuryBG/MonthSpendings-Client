import i18n, { AppLanguage, isSupportedLanguage } from '@/i18n';
import bg from './bg';
import en from './en';
import es from './es';

export type LegalSection = { title: string; body: string };

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  /** Shown on translated documents: the English version prevails. */
  translationNotice?: string;
  sections: LegalSection[];
};

export type LegalContent = {
  terms: LegalDocument;
  privacy: LegalDocument;
};

const CONTENT: Record<AppLanguage, LegalContent> = { en, bg, es };

export function getLegalContent(language: string = i18n.language): LegalContent {
  return isSupportedLanguage(language) ? CONTENT[language] : CONTENT.en;
}
