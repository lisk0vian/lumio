import { useState, type ReactNode } from 'react'
import { Calculator, History, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import { GlossaryBlock } from './glossary-block'
import { HistorySidebar } from './history-sidebar'
import { MobileSettings, MobileSettingsReset } from './mobile-settings'
import { ShareReceiptButton } from './share-receipt'
import { SectionBlock } from './section'
import { TopBar } from './top-bar'
import { useLumioStore } from '@/stores/lumio-store'
import { EnergyScale, LevelHint } from './energy-scale'
import {
  buildReceipts,
  calculateKwhToMoney,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'
import { t, useActiveLang } from '@/i18n'

type MobileTab = 'calc' | 'hist' | 'ajustes'

// Nav config builder: resolved per render so it follows the active language.
function getTabs(): { key: MobileTab; label: string; icon: LucideIcon }[] {
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

function CalcPanel() {
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const isFixedChargeEnabled = useLumioStore(
    (state) => state.isFixedChargeEnabled
  )
  const isPublicLightingEnabled = useLumioStore(
    (state) => state.isPublicLightingEnabled
  )
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const period = useLumioStore((state) => state.period)
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)
  const activeLang = useLumioStore((state) => state.activeLang)

  const inputs = {
    pricePerKwh,
    fixedCharge,
    publicLightingCharge,
    igvRate,
    isFixedChargeEnabled,
    isPublicLightingEnabled,
    isTaxEnabled,
    period,
  }
  const isKwhMode = direction === 'kwh-to-money'
  const activeKwh = isKwhMode
    ? inputKwh
    : calculateMoneyToKwh(inputMoney, inputs).kwh
  const displayTotal = isKwhMode
    ? calculateKwhToMoney(inputKwh, inputs).total
    : activeKwh
  const { receipts } = buildReceipts(activeKwh, inputs, activeLang)

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('calculator.title')}</MobileEyebrow>
      <SummaryTotal
        total={displayTotal}
        unit={isKwhMode ? 'money' : 'kwh'}
        surchages={
          isKwhMode
            ? [t('calculator.withoutIgv'), t('calculator.netAmount')]
            : [t('calculator.estimatedConsumption')]
        }
      />
      <ShareReceiptButton className="mt-4" />
      <div className="mt-4">
        <EnergyScale activeKwh={activeKwh} />
        <LevelHint
          activeKwh={activeKwh}
          className="mt-2 text-xs text-muted-foreground"
        />
      </div>
      <ConversionToggle />
      <CountTotal showResumen />
      <div className="mt-6">
        <SectionBlock title={t('receipt.breakdown')}>
          <ReceiptDetails receipts={receipts} />
        </SectionBlock>
      </div>
    </div>
  )
}

function HistPanel() {
  const records = useLumioStore((state) => state.records)
  const [sidebarHidden, setSidebarHidden] = useState(false)

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
        <HistoryDetails />
      </div>
      <div className="mt-4">
        <HistorySidebar
          hidden={sidebarHidden}
          onHide={() => setSidebarHidden(true)}
          onShow={() => setSidebarHidden(false)}
        />
      </div>
    </div>
  )
}

function AjustesPanel() {
  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('nav.settings')}</MobileEyebrow>
      <MobileSettings />
      <MobileSettingsReset />
      <div className="mt-6">
        <SectionBlock title={t('sections.glossary')}>
          <GlossaryBlock />
        </SectionBlock>
      </div>
    </div>
  )
}

export const MobileTabs = () => {
  const [tab, setTab] = useState<MobileTab>('calc')
  useActiveLang()
  const TABS = getTabs()

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground lg:hidden">
      <div className="flex-none px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <TopBar />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'calc' ? (
          <CalcPanel />
        ) : tab === 'hist' ? (
          <HistPanel />
        ) : (
          <AjustesPanel />
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
