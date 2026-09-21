import { useState, type FC } from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import { ReferenceBlock } from './reference-block'
import { GlossaryBlock } from './glossary-block'
import { SavingTip } from './saving-tip'
import { HistorySidebar } from './history-sidebar'
import { MobileTabs } from './mobile-tabs'
import { SectionBlock } from './section'
import { SettingOptions } from './setting-options'
import { useTariff } from '@/tariff-store'
import { useSettings } from '@/settings-store'
import { EnergyScale } from './energy-scale'
import { buildReceiptBreakdown } from '@/utils/tariffs.utils'

type MainProps = {
  records: { kwh: number; money: number }[]
}

export const Main: FC<MainProps> = ({ records }) => {
  const { fee } = useTariff()
  const { hasTax, tax } = useSettings()
  const [sidebarHidden, setSidebarHidden] = useState(false)

  const receipts = buildReceiptBreakdown(fee, hasTax, tax).receipts

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="flex w-full flex-col items-stretch xl:min-h-screen xl:flex-row">
        <div className="contents max-lg:hidden">
        <div className="mx-auto flex w-full min-w-0 max-w-9/10 flex-1 flex-col px-6 pt-8 pb-8 md:px-11.5 md:pt-11 md:pb-7.5 2xl:pt-16 2xl:pb-12">
          <div className="my-auto flex flex-col items-start gap-8 lg:flex-row lg:gap-11 2xl:gap-16">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="mb-3 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase 2xl:mb-4 2xl:text-xs">
                Total a pagar
              </p>
              <SummaryTotal total={0} surchages={['Sin IGV', 'Monto neto']} />
              <ConversionToggle />
              <CountTotal />
              <div className="mt-6 grid grid-cols-1 items-start gap-8 border-t border-border pt-5 md:grid-cols-2 md:gap-8.5 2xl:mt-10 2xl:gap-12 2xl:pt-8">
                <SectionBlock title="Desglose del recibo">
                  <ReceiptDetails receipts={receipts} />
                </SectionBlock>
                <SectionBlock title="Tus cálculos guardados">
                  <HistoryDetails records={records} />
                  <ReferenceBlock />
                </SectionBlock>
              </div>
            </div>
            <div className="flex w-full flex-none flex-col lg:w-90">
              <SectionBlock title="Tu nivel de consumo">
                <p className="mt-2 mb-3 text-[1.75rem] leading-tight 2xl:text-[2.25rem]">Sin datos</p>
                <EnergyScale />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Escribe tu consumo para saber si es alto o normal
                </p>
              </SectionBlock>
              <SavingTip />
              <div className="mt-6 border-t border-border pt-5 2xl:mt-8 2xl:pt-7">
                <SectionBlock title="Qué significa cada cosa">
                  <GlossaryBlock />
                </SectionBlock>
              </div>
            </div>
          </div>

          <SettingOptions />
        </div>

        <HistorySidebar
          records={records}
          hidden={sidebarHidden}
          onHide={() => setSidebarHidden(true)}
          onShow={() => setSidebarHidden(false)}
        />
        </div>
        <MobileTabs records={records} />
      </main>
    </div>
  )
}
