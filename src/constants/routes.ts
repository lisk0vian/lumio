import type { AppLang } from '@/i18n/ui'

// Prerendered routes per language. Language switching keeps the user on the
// same page (home <-> home, calculation <-> calculo), never bouncing to `/`.

export const HOME_ROUTES: Record<AppLang, string> = { es: '/', en: '/en/' }

export function homePath(lang: AppLang): string {
  return HOME_ROUTES[lang]
}

export const CALCULATION_ROUTES: Record<AppLang, string> = {
  es: '/calculo',
  en: '/en/calculation',
}

export function calculationPath(lang: AppLang): string {
  return CALCULATION_ROUTES[lang]
}
