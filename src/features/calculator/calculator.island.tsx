import type { FC } from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ShareReceiptButton } from '../share/share-receipt'
import { useLumioStore } from '@/stores/lumio-store'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { useStoreRehydration } from '@/hooks/use-store-rehydration'
import { calculateKwhToMoney } from '@/utils/tariffs.utils'
import {
  getSummaryContent,
  useActiveKwh,
  useCalculationInputs,
} from './use-calculation-inputs'
import { useTranslations, type AppLang } from '@/i18n'

// Interactive core of the left column: total, share, direction toggle and
// input. Section wrappers and titles live in Astro (AppPage); the receipt
// and saved sections are sibling islands sharing the same store cohort.
export const CalculatorBlock: FC<{ lang: AppLang }> = ({ lang }) => {
  const inputs = useCalculationInputs()
  const activeKwh = useActiveKwh(inputs)
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const t = useTranslations(lang)
  const enterRef = useEnterAnimation<HTMLDivElement>()
  useStoreRehydration()

  const isKwhMode = direction === 'kwh-to-money'
  const displayTotal = isKwhMode
    ? calculateKwhToMoney(inputKwh, inputs).total
    : activeKwh
  const { unit, surcharges } = getSummaryContent({
    isKwhMode,
    isTaxEnabled,
    t,
  })

  return (
    // display:contents keeps a single island root without adding layout.
    <div ref={enterRef} className="contents">
      <SummaryTotal
        total={displayTotal}
        unit={unit}
        surcharges={surcharges}
      />
      <ShareReceiptButton lang={lang} className="mt-3" />
      <ConversionToggle lang={lang} />
      <CountTotal lang={lang} />
    </div>
  )
}
