import type { AppLang } from '@/i18n/ui'

// Prerendered routes per language. Language switching keeps the user on the
// same page (home <-> home, calculation <-> calculo), never bouncing to `/`.
//
// Base-aware: `import.meta.env.BASE_URL` is `/` in dev and `/lumio/` in the
// GitHub Pages build (see `base` in astro.config.mjs). Every href goes through
// `withBase` so the static anchors work in both.

const BASE = import.meta.env.BASE_URL ?? '/'

function withBase(path: string): string {
  return `${BASE.replace(/\/$/, '')}${path}`
}

export const HOME_ROUTES: Record<AppLang, string> = {
  es: withBase('/'),
  en: withBase('/en/'),
}

export function homePath(lang: AppLang): string {
  return HOME_ROUTES[lang]
}

export const CALCULATION_ROUTES: Record<AppLang, string> = {
  es: withBase('/calculo'),
  en: withBase('/en/calculation'),
}

export function calculationPath(lang: AppLang): string {
  return CALCULATION_ROUTES[lang]
}
