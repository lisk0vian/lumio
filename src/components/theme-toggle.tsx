import { Moon, Sun } from 'lucide-react'

// Stateless theme toggle: the icon swaps via pure CSS (.dark variant),
// so there is no React state to hydrate and no first-paint flash —
// Layout.astro's inline script already sets the class before paint.
// Clicking persists localStorage.theme, which opts out of following
// the OS preference (same behavior as the existing inline script).
export const ThemeToggle = () => {
  const toggle = () => {
    const root = document.documentElement
    const dark = root.classList.toggle('dark')
    try {
      localStorage.theme = dark ? 'dark' : 'light'
    } catch {
      // storage unavailable (private mode): theme still applies to the session
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema / Toggle theme"
      title="Cambiar tema / Toggle theme"
      className="flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  )
}
