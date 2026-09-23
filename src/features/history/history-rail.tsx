import { useState, type FC } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronLeft } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'
import { HistoryClearButton } from './history-clear-button'
import { HistoryRecordList } from './history-record-list'

// Desktop history rail: a compact tab pinned to the right edge whenever there
// are records, opening the drawer on click. z-40 stays under the drawer
// overlay (z-50). Mobile keeps its inline tab panel instead.
//
// The wrapper spans the full height to centre the tab, so it is
// pointer-events-none and only the tab itself is auto -- otherwise it would
// eat clicks along a 40px strip down the whole right edge of the page.
//
// Lazy-mounted by history-rail.loader.ts (Astro has no client:hover): this is
// deliberately not an *.island.tsx hydration root. The loader mounts it the
// moment the first record exists, on this visit or from storage.
export const HistoryRail: FC<{ lang: AppLang }> = ({ lang }) => {
  const records = useLumioStore((state) => state.records)
  const t = useTranslations(lang)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Fires when the wrapper first attaches, which is exactly when the tab
  // becomes real -- same path for a first save and for a reload with history.
  // fromX 48 clears the 40px tab: it slides out from behind the viewport
  // edge instead of nudging sideways, which is the motion the shape implies.
  const enterRef = useEnterAnimation<HTMLDivElement>({
    duration: 320,
    fromX: 48,
    fromY: 0,
  })

  // `|| drawerOpen` is load-bearing: clearing every record with the drawer open
  // would otherwise unmount the Drawer root and rip it off screen mid-gesture.
  // Closing it afterwards drops the tab and leaves focus on <body>; accepted,
  // since there is no longer anything to return focus to.
  if (records.length === 0 && !drawerOpen) return null

  return (
    <div
      ref={enterRef}
      className="pointer-events-none fixed inset-y-0 right-0 z-40 flex items-center"
    >
      <Drawer swipeDirection="right" onOpenChange={setDrawerOpen}>
        {/* writing-mode: vertical-rl turns the flex main axis vertical, so the
            chevron stacks above the label. The icon is the affordance the
            ghost rail never had: it points the way the drawer opens. */}
        <DrawerTrigger
          aria-label={`${t('history.open')} · ${records.length}`}
          className={cn(
            'group pointer-events-auto flex w-10 cursor-pointer items-center justify-center gap-2.5 py-4',
            'rounded-l-lg border border-r-0 border-border bg-muted',
            'text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase [writing-mode:vertical-rl]',
            'outline-none transition-colors duration-200 ease-out motion-reduce:transition-none',
            'hover:border-ember/40 hover:text-foreground',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring'
          )}
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-3 shrink-0 opacity-60 transition-opacity duration-200 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          />
          <span>
            {t('history.title')} <span className="opacity-45">·</span>{' '}
            <span key={records.length} className="count-pop font-medium text-ember">
              {records.length}
            </span>
          </span>
        </DrawerTrigger>
        <DrawerContent className="bg-muted">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-8">
            <div className="mb-3 flex items-baseline justify-between">
              <DrawerTitle className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {t('history.title')} · {records.length}
              </DrawerTitle>
              <div className="flex gap-3">
                <HistoryClearButton lang={lang} />
                <DrawerClose className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]">
                  {t('history.hide')}
                </DrawerClose>
              </div>
            </div>
            {records.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t('history.empty')}</p>
            ) : (
              <HistoryRecordList lang={lang} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

/** Manual mount entry for the loader (not an Astro island). */
export function mountHistoryRailPanel(rootEl: Element, opts: { lang: AppLang }) {
  createRoot(rootEl).render(<HistoryRail lang={opts.lang} />)
}
