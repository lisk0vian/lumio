import { useState, type FC, useEffect } from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import { ReferenceBlock } from './reference-block'
import { GlossaryBlock } from './glossary-block'
import { SavingTip } from './saving-tip'
import { ShareReceiptButton } from './share-receipt'
import { HistorySidebar } from './history-sidebar'
import { MobileTabs } from './mobile-tabs'
import { TopBar } from './top-bar'
import { SectionBlock } from './section'
import { SettingOptions } from './setting-options'
import { useLumioStore } from '@/stores/lumio-store'
import { EnergyScale, LevelHint, LevelTitle } from './energy-scale'
import {
  buildReceipts,
  calculateKwhToMoney,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'
import { t, useActiveLang } from '@/i18n'

export const Main: FC = () => {
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
  const activeLang = useActiveLang()
  // Gate first paint on persist rehydration: avoids flashing default
  // tariff/inputs/total before stored values land. Double-checked so the
  // gate can never get stuck if rehydration already finished.
  const [hydrated, setHydrated] = useState(() =>
    useLumioStore.persist.hasHydrated()
  )
  // Closed by default and never persisted: refresh always returns to closed.
  const [sidebarHidden, setSidebarHidden] = useState(true)

  useEffect(() => {
    if (useLumioStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useLumioStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  useEffect(() => {
    document.documentElement.lang = activeLang
  }, [activeLang])

  if (!hydrated) return null

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

  const receipts = buildReceipts(activeKwh, inputs, activeLang).receipts

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="flex min-h-screen w-full flex-col items-stretch xl:flex-row">
        <div className="contents max-lg:hidden">
        <div className="mx-auto flex w-full min-w-0 max-w-9/10 flex-1 flex-col px-6 pt-8 pb-8 md:px-11.5 md:pt-11 md:pb-7.5 2xl:pt-16 2xl:pb-12">
          <TopBar />
          <div className="my-auto flex flex-col items-start gap-8 lg:flex-row lg:gap-11 2xl:gap-16">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="mb-3 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase 2xl:mb-4 2xl:text-xs">
                {t('calculator.title')}
              </p>
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
              <ConversionToggle />
              <CountTotal />
              <div className="mt-6 grid grid-cols-1 items-start gap-8 border-t border-border pt-5 md:grid-cols-2 md:gap-8.5 2xl:mt-10 2xl:gap-12 2xl:pt-8">
                <SectionBlock title={t('receipt.breakdown')}>
                  <ReceiptDetails receipts={receipts} />
                </SectionBlock>
                <SectionBlock title={t('sections.saved')}>
                  <HistoryDetails />
                  <ReferenceBlock />
                </SectionBlock>
              </div>
            </div>
            <div className="flex w-full flex-none flex-col lg:w-90">
              <SectionBlock title={t('sections.level')}>
                <LevelTitle
                  activeKwh={activeKwh}
                  className="mt-2 mb-3 text-[1.75rem] leading-tight 2xl:text-[2.25rem]"
                />
                <EnergyScale activeKwh={activeKwh} />
                <LevelHint
                  activeKwh={activeKwh}
                  className="mt-2 text-xs leading-relaxed text-muted-foreground"
                />
              </SectionBlock>
              <SavingTip />
              <div className="mt-6 border-t border-border pt-5 2xl:mt-8 2xl:pt-7">
                <SectionBlock title={t('sections.glossary')}>
                  <GlossaryBlock />
                </SectionBlock>
              </div>
            </div>
          </div>

          <SettingOptions />
        </div>

        <HistorySidebar
          hidden={sidebarHidden}
          onHide={() => setSidebarHidden(true)}
          onShow={() => setSidebarHidden(false)}
        />
        </div>
        <MobileTabs />
      </main>
    </div>
  )
}
