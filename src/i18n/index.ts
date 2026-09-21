import { useLumioStore } from '@/stores/lumio-store'
import { defaultLang, ui, type AppLang } from './ui'
import { useTranslations, type I18nKey } from './utils'

export type { AppLang, I18nKey }
export { defaultLang, ui, useTranslations }

/**
 * Legacy alias: resolves against the active store language with
 * fallback to default. Consuming components re-render because their
 * ancestors subscribe to `activeLang`.
 */
export function t(key: I18nKey): string {
  const lang = useLumioStore.getState().activeLang ?? defaultLang
  return ui[lang][key] ?? ui[defaultLang][key]
}

export function useActiveLang(): AppLang {
  return useLumioStore((state) => state.activeLang)
}
