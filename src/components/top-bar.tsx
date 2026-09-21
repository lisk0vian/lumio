import { Zap } from 'lucide-react'
import { LanguagePicker } from './language-picker'
import { ThemeToggle } from './theme-toggle'

// Slim utility header shared by the desktop and mobile shells:
// brand on the left, language + theme controls on the right.
export const TopBar = () => {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className="flex min-w-0 items-center gap-2">
        <span className="flex size-6 flex-none items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-4" aria-hidden="true" />
        </span>
        <span className="truncate text-sm font-medium">Lumio</span>
      </p>
      <div className="flex flex-none items-center gap-1">
        <LanguagePicker />
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <ThemeToggle />
      </div>
    </div>
  )
}
