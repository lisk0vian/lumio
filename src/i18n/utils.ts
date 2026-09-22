import { defaultLang, ui, type AppLang } from './ui'

export type I18nKey = keyof typeof ui[typeof defaultLang]

export function useTranslations(lang: AppLang) {
  return function translate(key: I18nKey): string {
    return ui[lang][key] ?? ui[defaultLang][key]
  }
}

/**
 * Language from a localized URL: `/en/...` is English, everything else is
 * the default language. Used by shared helpers; Astro pages already know
 * their language statically from the route.
 */
export function getLangFromUrl(url: URL): AppLang {
  const first = url.pathname.split('/').filter(Boolean)[0]
  return first === 'en' ? 'en' : defaultLang
}
