import { Moon, Sun } from 'lucide-react'
import { THEME_TOGGLE_CLASS, THEME_TOGGLE_LABEL } from './header-classes'

// Stateless theme toggle: markup only, no React state. The icon swaps via
// pure CSS (.dark variant), and the click is handled by Layout.astro's
// delegated listener, so this button works before (and without) hydration —
// including inside MobileTabs, where no Astro component can reach.
// Layout.astro's inline script already sets the class before paint.
export const ThemeToggle = () => {
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label={THEME_TOGGLE_LABEL}
      title={THEME_TOGGLE_LABEL}
      className={THEME_TOGGLE_CLASS}
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  )
}
