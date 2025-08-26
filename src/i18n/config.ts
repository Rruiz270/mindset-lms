export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'pt', 'es'] as const,
} as const

export type Locale = (typeof i18n)['locales'][number]

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  pt: { name: 'Português', flag: '🇧🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
} as const