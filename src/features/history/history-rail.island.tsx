import type { FC } from 'react'
import { X } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useLumioStore } from '@/stores/lumio-store'
import { useHydrated } from '@/stores/use-hydrated'
import { useTranslations, type AppLang } from '@/i18n'

// Desktop history: the thin vertical rail stays as the drawer trigger (same
// look and discovery); records live in a right-side overlay drawer with
// overlay/Esc/swipe-to-close from Base UI. Uncontrolled and never persisted:
// refresh always returns to closed. Mobile keeps its inline tab panel.
export const HistoryRail: FC<{ lang: AppLang }> = ({ lang }) => {
  const records = useLumioStore((state) => state.records)
  const removeRecord = useLumioStore((state) => state.removeRecord)
  const clearRecords = useLumioStore((state) => state.clearRecords)
  const t = useTranslations(lang)
  const hydrated = useHydrated()

  if (!hydrated || records.length === 0) return null

  return (
    <Drawer swipeDirection="right">
      <div className="flex w-full flex-none justify-center bg-muted py-4 xl:w-27.5 xl:py-11">
        <DrawerTrigger className="cursor-pointer text-xs tracking-[0.14em] text-muted-foreground uppercase xl:[writing-mode:vertical-rl]">
          {t('history.title')} ·{' '}
          <span key={records.length} className="count-pop">
            {records.length}
          </span>
        </DrawerTrigger>
      </div>
      <DrawerContent className="bg-muted">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-8">
          <div className="mb-3 flex items-baseline justify-between">
            <DrawerTitle className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {t('history.title')} · {records.length}
            </DrawerTitle>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearRecords}
                className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]"
              >
                {t('history.clear')}
              </button>
              <DrawerClose className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]">
                {t('history.hide')}
              </DrawerClose>
            </div>
          </div>
          {records.map(({ id, resultKwh, resultMoney }) => (
            <div key={id} className="record-enter border-b border-border py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {resultKwh.toFixed(1)} kWh
                </span>
                <span className="font-mono text-base font-medium tabular-nums">
                  S/ {resultMoney.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => removeRecord(id)}
                  aria-label={t('history.remove')}
                  className="cursor-pointer font-mono text-xs text-muted-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
