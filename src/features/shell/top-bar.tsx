import { Zap } from 'lucide-react'
import { LanguagePicker } from './language-picker'
import { ThemeToggle } from './theme-toggle'
import {
  BRAND_BADGE_CLASS,
  BRAND_NAME_CLASS,
  BRAND_ROW_CLASS,
  HEADER_CONTROLS_CLASS,
  HEADER_DIVIDER_CLASS,
} from './header-classes'
import type { AppLang } from '@/i18n'

// Slim utility header for the mobile shell (inside the MobileTabs island):
// brand on the left, language + theme controls on the right.
// The desktop shell uses the static top-bar.astro instead; shared class
// strings live in header-classes.ts.
export const TopBar = ({
  lang,
  routes,
}: {
  lang: AppLang
  routes?: Record<AppLang, string>
}) => {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className={BRAND_ROW_CLASS}>
        <span className={BRAND_BADGE_CLASS}>
          <Zap className="size-4" aria-hidden="true" />
        </span>
        <span className={BRAND_NAME_CLASS}>Lumio</span>
      </p>
      <div className={HEADER_CONTROLS_CLASS}>
        <LanguagePicker lang={lang} routes={routes} />
        <span className={HEADER_DIVIDER_CLASS} aria-hidden="true" />
        <ThemeToggle />
      </div>
    </div>
  )
}
