import { useState } from 'react'
import { Calculator, History, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from './top-bar'
import {
  AjustesPanel,
  CalcPanel,
  HistPanel,
  type MobileTab,
} from './mobile-panels'
import { useTranslations, type AppLang } from '@/i18n'
import type { I18nKey } from '@/i18n/utils'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { useStoreRehydration } from '@/hooks/use-store-rehydration'

// Nav config builder: resolved per render from the page language.
function getTabs(
  t: (key: I18nKey) => string
): { key: MobileTab; label: string; icon: LucideIcon }[] {
  return [
    { key: 'calc', label: t('nav.calculate'), icon: Calculator },
    { key: 'hist', label: t('nav.history'), icon: History },
    { key: 'ajustes', label: t('nav.settings'), icon: Settings },
  ]
}

export const MobileTabs = ({ lang }: { lang: AppLang }) => {
  const [tab, setTab] = useState<MobileTab>('calc')
  const t = useTranslations(lang)
  const TABS = getTabs(t)
  const enterRef = useEnterAnimation<HTMLDivElement>()
  useStoreRehydration()

  return (
    // min-w-0: this panel is a flex item of <main>, so without it any
    // unshrinkable descendant widens the entire mobile shell past the viewport.
    <div
      ref={enterRef}
      className="flex h-dvh min-w-0 flex-col bg-background text-foreground lg:hidden"
    >
      <div className="flex-none px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <TopBar lang={lang} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'calc' ? (
          <CalcPanel lang={lang} />
        ) : tab === 'hist' ? (
          <HistPanel lang={lang} />
        ) : (
          <AjustesPanel lang={lang} />
        )}
      </div>
      <nav className="sticky bottom-0 flex flex-none border-t border-border bg-muted/40 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mt-px flex min-h-11 flex-1 cursor-pointer flex-col items-center justify-center gap-1 border-t-2 pt-2 pb-1 text-xs',
              tab === key
                ? 'border-ember font-medium text-foreground'
                : 'border-transparent font-normal text-muted-foreground'
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
