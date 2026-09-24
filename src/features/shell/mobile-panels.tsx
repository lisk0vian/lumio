import { useState, type ReactNode } from 'react'
import { SummaryTotal } from '../calculator/summary-total'
import { ConversionToggle } from '../calculator/conversion-toggle'
import { CountTotal } from '../calculator/count-total'
import { ReceiptDetails } from '../calculator/receipt-details'
import { HistoryDetails } from '../history/history-details'
import { GlossaryBlock } from '../glossary/glossary-block'
import { HistorySidebar } from '../history/history-sidebar'
import {
  MobileSettings,
  MobileSettingsReset,
} from '../settings/mobile-settings'
import { ShareReceiptButton } from '../share/share-receipt'
import { SectionBlock } from './section'
import { useLumioStore } from '@/stores/lumio-store'
import { EnergyScale, LevelHint } from '../consumption/energy-scale'
import { buildReceipts } from '@/utils/receipt-builder'
import { calculateKwhToMoney } from '@/utils/calculation.utils'
import {
  getSummaryContent,
  useActiveKwh,
  useCalculationInputs,
} from '../calculator/use-calculation-inputs'
import { getReceiptLabels } from '../calculator/receipt-labels'
import { calculationPath } from '@/constants/routes'
import { useTranslations, type AppLang } from '@/i18n'

export type MobileTab = 'calc' | 'hist' | 'ajustes'

function MobileEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </p>
  )
}

export function CalcPanel({ lang }: { lang: AppLang }) {
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
      <SummaryTotal total={displayTotal} unit={unit} surcharges={surcharges} />
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
            href={calculationPath(lang)}
            className="inline-flex min-h-11 items-center text-xs link-ember"
          >
            {t('explainer.link')}
          </a>
        </p>
      </div>
    </div>
  )
}

export function HistPanel({ lang }: { lang: AppLang }) {
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
      <MobileEyebrow>
        {t('history.title')} · {records.length}
      </MobileEyebrow>
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

export function AjustesPanel({ lang }: { lang: AppLang }) {
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
