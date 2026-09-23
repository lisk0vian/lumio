import { useState, type ReactNode } from 'react'
import { Calculator, History, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SummaryTotal } from '../calculator/summary-total'
import { ConversionToggle } from '../calculator/conversion-toggle'
import { CountTotal } from '../calculator/count-total'
import { ReceiptDetails } from '../calculator/receipt-details'
import { HistoryDetails } from '../history/history-details'
import { GlossaryBlock } from '../glossary/glossary-block'
import { HistorySidebar } from '../history/history-sidebar'
import { MobileSettings, MobileSettingsReset } from '../settings/mobile-settings'
import { ShareReceiptButton } from '../share/share-receipt'
import { SectionBlock } from './section'
import { TopBar } from './top-bar'
import { useLumioStore } from '@/stores/lumio-store'
import { EnergyScale, LevelHint } from '../consumption/energy-scale'
import {
  buildReceipts,
  calculateKwhToMoney,
} from '@/utils/tariffs.utils'
import {
  getSummaryContent,
  useActiveKwh,
  useCalculationInputs,
} from '../calculator/use-calculation-inputs'
import { getReceiptLabels } from '../calculator/receipt-labels'
import { useTranslations, type AppLang } from '@/i18n'
import type { I18nKey } from '@/i18n/utils'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { useStoreRehydration } from '@/hooks/use-store-rehydration'

type MobileTab = 'calc' | 'hist' | 'ajustes'

// Nav config builder: resolved per render from the page language.
function getTabs(t: (key: I18nKey) => string): { key: MobileTab; label: string; icon: LucideIcon }[] {
  return [
    { key: 'calc', label: t('nav.calculate'), icon: Calculator },
    { key: 'hist', label: t('nav.history'), icon: History },
    { key: 'ajustes', label: t('nav.settings'), icon: Settings },
  ]
}

function MobileEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function CalcPanel({ lang }: { lang: AppLang }) {
  const inputs = useCalculationInputs()
  const activeKwh = useActiveKwh(inputs)
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const t = useTranslations(lang)

  const isKwhMode = direction === 'kwh-to-money'
  const displayTotal = isKwhMode
    ? calculateKwhToMoney(inputKwh, inputs).total
    : activeKwh
  const { receipts } = buildReceipts(activeKwh, inputs, getReceiptLabels(t))
  const { unit, surcharges } = getSummaryContent({
    isKwhMode,
    isTaxEnabled,
    t,
  })

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('calculator.title')}</MobileEyebrow>
      <SummaryTotal
        total={displayTotal}
        unit={unit}
        surcharges={surcharges}
      />
      <ShareReceiptButton lang={lang} className="mt-4" />
      <div className="mt-4">
        <EnergyScale lang={lang} activeKwh={activeKwh} />
        <LevelHint
          lang={lang}
          activeKwh={activeKwh}
          className="mt-2 text-xs text-muted-foreground"
        />
      </div>
      <ConversionToggle lang={lang} />
      <CountTotal lang={lang} showResumen />
      <div className="mt-6">
        <SectionBlock title={t('receipt.breakdown')}>
          <ReceiptDetails receipts={receipts} />
        </SectionBlock>
        <p className="mt-3">
          <a
            href={lang === 'en' ? '/en/calculation' : '/calculo'}
            className="inline-flex min-h-11 items-center text-xs link-ember"
          >
            {t('explainer.link')}
          </a>
        </p>
      </div>
    </div>
  )
}

function HistPanel({ lang }: { lang: AppLang }) {
  const records = useLumioStore((state) => state.records)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const t = useTranslations(lang)

  if (records.length === 0) {
    return (
      <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
        <MobileEyebrow>{t('history.title')} · 0</MobileEyebrow>
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {t('history.emptyShort')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('history.title')} · {records.length}</MobileEyebrow>
      <div className="mt-3.5 mb-6">
        <HistoryDetails lang={lang} />
      </div>
      <div className="mt-4">
        <HistorySidebar
          lang={lang}
          hidden={sidebarHidden}
          onHide={() => setSidebarHidden(true)}
          onShow={() => setSidebarHidden(false)}
        />
      </div>
    </div>
  )
}

function AjustesPanel({ lang }: { lang: AppLang }) {
  const t = useTranslations(lang)
  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('nav.settings')}</MobileEyebrow>
      <MobileSettings lang={lang} />
      <MobileSettingsReset lang={lang} />
      <div className="mt-6">
        <GlossaryBlock lang={lang} groupId="glossary-mobile" />
      </div>
    </div>
  )
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
