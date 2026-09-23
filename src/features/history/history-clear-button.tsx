import { useEffect, useRef, useState, type FC } from 'react'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

// Clearing wipes up to HISTORY_LIMIT records with no undo, so it takes two
// clicks: the first arms the button and the second commits. The armed state
// disarms itself after CLEAR_CONFIRM_MS, and in the drawer it also resets for
// free because Base UI unmounts the popup on close.
const CLEAR_CONFIRM_MS = 3000

export const HistoryClearButton: FC<{ lang: AppLang; className?: string }> = ({
  lang,
  className,
}) => {
  const clearRecords = useLumioStore((state) => state.clearRecords)
  const t = useTranslations(lang)
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    []
  )

  const handleClick = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    if (armed) {
      setArmed(false)
      clearRecords()
      return
    }
    setArmed(true)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setArmed(false)
    }, CLEAR_CONFIRM_MS)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={cn(
        'cursor-pointer text-xs underline underline-offset-[3px] max-lg:min-h-11 max-lg:px-2',
        armed ? 'font-medium text-ember' : 'text-muted-foreground',
        className
      )}
    >
      {t(armed ? 'history.clearConfirm' : 'history.clear')}
    </button>
  )
}
