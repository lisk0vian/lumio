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
import { useTariff } from '@/tariff-store'
import { useSettings } from '@/settings-store'
import { EnergyScale } from './energy-scale'
import { buildReceiptBreakdown } from '@/utils/tariffs.utils'

type MobileTab = 'calc' | 'hist' | 'ajustes'

type HistoryRecord = {
  kwh: number
  money: number
}

// Hoisted nav config: static, never recreated per render.
const TABS: { key: MobileTab; label: string }[] = [
  { key: 'calc', label: 'Calcular' },
  { key: 'hist', label: 'Historial' },
  { key: 'ajustes', label: 'Ajustes' },
]

function MobileEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

function CalcPanel() {
  const { fee } = useTariff()
  const { hasTax, tax } = useSettings()
  const { receipts } = buildReceiptBreakdown(fee, hasTax, tax)

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>Total a pagar</MobileEyebrow>
      <SummaryTotal total={0} surchages={['Sin IGV', 'Monto neto']} />
      <div className="mt-4">
        <EnergyScale />
        <p className="mt-2 text-xs text-muted-foreground">
          Escribe tu consumo para saber si es alto o normal
        </p>
      </div>
      <ConversionToggle />
      <CountTotal showResumen />
      <div className="mt-6">
        <SectionBlock title="Desglose del recibo">
          <ReceiptDetails receipts={receipts} />
        </SectionBlock>
      </div>
    </div>
  )
}

function HistPanel({ records }: { records: HistoryRecord[] }) {
  const [sidebarHidden, setSidebarHidden] = useState(false)

  if (records.length === 0) {
    return (
      <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
        <MobileEyebrow>Historial · 0</MobileEyebrow>
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
          Todavía no guardas nada. Escribe tu consumo en Calcular y presiona Enter.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-5 pt-12 pb-4">
      <MobileEyebrow>Historial · {records.length}</MobileEyebrow>
      <div className="mt-3.5 mb-6">
        <HistoryDetails records={records} />
      </div>
      <div className="mt-4">
        <HistorySidebar
          records={records}
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
      <MobileEyebrow>Ajustes</MobileEyebrow>
      <MobileSettings />
      <MobileSettingsReset />
      <div className="mt-6">
        <SectionBlock title="Qué significa cada cosa">
          <GlossaryBlock />
        </SectionBlock>
      </div>
    </div>
  )
}

export const MobileTabs = ({ records }: { records: HistoryRecord[] }) => {
  const [tab, setTab] = useState<MobileTab>('calc')

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground lg:hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'calc' ? (
          <CalcPanel />
        ) : tab === 'hist' ? (
          <HistPanel records={records} />
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
