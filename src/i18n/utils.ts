import { defaultLang, ui, type AppLang } from './ui'

export type I18nKey = keyof typeof ui[typeof defaultLang]

export function useTranslations(lang: AppLang) {
  return function translate(key: I18nKey): string {
    return ui[lang][key] ?? ui[defaultLang][key]
  }
}

/**
 * Recipe-shaped helper kept for a future with localized URLs.
 * Single-URL mode: always resolves to the default language.
 */
export function getLangFromUrl(_url: URL): AppLang {
  return defaultLang
}

/** Initial language: stored choice wins, else browser, else default. */
export function resolveInitialLang(stored: AppLang | undefined): AppLang {
  if (stored === 'es' || stored === 'en') return stored
  if (typeof navigator !== 'undefined') {
    const browser = navigator.language.toLowerCase()
    if (browser.startsWith('en')) return 'en'
  }
  return defaultLang
}
