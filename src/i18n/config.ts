export const locales = ['en', 'ko'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'ko';

export const localeNames = {
  en: 'English',
  ko: '한국어'
} as const;

export const localeFlags = {
  en: '🇺🇸',
  ko: '🇰🇷'
} as const;