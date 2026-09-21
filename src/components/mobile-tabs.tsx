import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import { GlossaryBlock } from './glossary-block'
import { HistorySidebar } from './history-sidebar'
import { MobileSettings, MobileSettingsReset } from './mobile-settings'
import { SectionBlock } from './section'
import { useLumioStore } from '@/stores/lumio-store'
import { EnergyScale } from './energy-scale'
import {
  buildReceipts,
  calculateKwhToMoney,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'
import { t } from '@/i18n'

type MobileTab = 'calc' | 'hist' | 'ajustes'

// Hoisted nav config: static, never recreated per render.
const TABS: { key: MobileTab; label: string }[] = [
  { key: 'calc', label: t('nav.calculate') },
  { key: 'hist', label: t('nav.history') },
  { key: 'ajustes', label: t('nav.settings') },
]

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
    : inputMoney
  const { receipts } = buildReceipts(activeKwh, inputs)

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>{t('calculator.title')}</MobileEyebrow>
      <SummaryTotal total={displayTotal} surchages={[t('calculator.withoutIgv'), t('calculator.netAmount')]} />
      <div className="mt-4">
        <EnergyScale />
        <p className="mt-2 text-xs text-muted-foreground">
          {t('calculator.writeConsumption')}
        </p>
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

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground lg:hidden">
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
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              '-mt-px min-h-11 flex-1 cursor-pointer border-t-2 pt-3 pb-1 text-xs',
              tab === key
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent font-normal text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
