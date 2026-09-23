import { useEffect, useMemo, useRef, type FC } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MONEY } from '@/types'
import { useLumioStore } from '@/stores/lumio-store'
import { formatRecordTime } from '@/utils/history-time.utils'
import { useTranslations, type AppLang } from '@/i18n'

// The one record list, shared by the desktop drawer and the mobile tab, so the
// two surfaces cannot drift again. Callers own their own empty copy
// (history.empty in the drawer, history.emptyShort on mobile) and this renders
// null instead. The max-lg: modifiers are inert on desktop and are what keeps
// the touch targets correct on mobile without inflating drawer density.

const NO_NEW_IDS: ReadonlySet<string> = new Set<string>()

export const HistoryRecordList: FC<{ lang: AppLang; className?: string }> = ({
  lang,
  className,
}) => {
  const records = useLumioStore((state) => state.records)
  const removeRecord = useLumioStore((state) => state.removeRecord)
  const t = useTranslations(lang)

  // The store appends, so the newest record is last; reverse at render only to
  // leave the .slice(-HISTORY_LIMIT) window and the persisted shape untouched.
  const ordered = useMemo(() => records.slice().reverse(), [records])

  // Only genuinely new rows play the enter animation. The ref is written in an
  // effect, never during render, so React 19 StrictMode's double invoke cannot
  // swallow the flag. Base UI unmounts the drawer popup on close, so a reopen
  // starts at null and nothing animates -- which is the bug this replaces.
  const prevIdsRef = useRef<string[] | null>(null)
  const newIds = useMemo(() => {
    const prev = prevIdsRef.current
    if (prev === null) return NO_NEW_IDS
    const prevSet = new Set(prev)
    return new Set(records.filter((r) => !prevSet.has(r.id)).map((r) => r.id))
  }, [records])
  useEffect(() => {
    prevIdsRef.current = records.map((r) => r.id)
  }, [records])

  if (ordered.length === 0) return null

  return (
    <div className={className}>
      {ordered.map(({ id, createdAt, resultKwh, resultMoney }) => (
        <div
          key={id}
          className={cn(
            'border-b border-border py-3',
            newIds.has(id) && 'record-enter'
          )}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {resultKwh.toFixed(1)} kWh
            </span>
            <span className="font-mono text-base font-medium tabular-nums">
              {MONEY} {resultMoney.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <time
              dateTime={createdAt}
              className="font-mono text-[0.625rem] tabular-nums text-muted-foreground"
            >
              {formatRecordTime(createdAt, lang)}
            </time>
            <button
              type="button"
              onClick={() => removeRecord(id)}
              aria-label={t('history.remove')}
              className="cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground max-lg:min-h-11 max-lg:px-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
