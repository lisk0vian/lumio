// Presentational constants shared by the twin headers (top-bar.tsx for the
// mobile island, top-bar.astro for the static desktop shell) and the twin
// theme toggles. Structure stays duplicated on purpose — one side is React,
// the other is zero-JS Astro markup — but the literal class strings and
// labels have a single source so both headers drift together.

/** Brand row: badge + wordmark. */
export const BRAND_ROW_CLASS = 'flex min-w-0 items-center gap-2'

/** Ember badge behind the zap glyph. */
export const BRAND_BADGE_CLASS =
  'flex size-6 flex-none items-center justify-center rounded-md bg-primary text-primary-foreground'

/** Wordmark text. */
export const BRAND_NAME_CLASS = 'truncate text-sm font-medium'

/** Right-side controls cluster (language + divider + theme). */
export const HEADER_CONTROLS_CLASS = 'flex flex-none items-center gap-1'

/** Hairline between language picker and theme toggle. */
export const HEADER_DIVIDER_CLASS = 'mx-1 h-4 w-px bg-border'

/** Stateless theme toggle button (CSS-only icon swap, delegated click). */
export const THEME_TOGGLE_CLASS =
  'flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground max-lg:min-h-11 max-lg:min-w-11'

export const THEME_TOGGLE_LABEL = 'Cambiar tema / Toggle theme'
