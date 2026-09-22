import type { FC } from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ShareReceiptButton } from '../share/share-receipt'
import { Skeleton } from '@/components/ui/skeleton'
import { useLumioStore } from '@/stores/lumio-store'
import { useHydrated } from '@/stores/use-hydrated'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'
import { useTranslations, type AppLang } from '@/i18n'

// Interactive core of the left column: total, share, direction toggle and
// input. Section wrappers and titles live in Astro (AppPage); the receipt
// and saved sections are sibling islands sharing the same store cohort.
export const CalculatorBlock: FC<{ lang: AppLang }> = ({ lang }) => {
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
  const t = useTranslations(lang)
  const hydrated = useHydrated()

  // SSR/prerender muestra el skeleton (mismas medidas que el total real)
  // para no pintar negro ni desplazar el layout antes de hidratar.
  if (!hydrated)
    return (
      <div className="contents" aria-hidden="true">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-4 h-11 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )

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

  return (
    // display:contents keeps a single island root without adding layout.
    <div className="contents">
      <SummaryTotal
        total={displayTotal}
        unit={isKwhMode ? 'money' : 'kwh'}
        surchages={
          isKwhMode
            ? [t(isTaxEnabled ? 'calculator.withIgv' : 'calculator.withoutIgv'), t('calculator.netAmount')]
            : [t('calculator.estimatedConsumption')]
        }
      />
      <ShareReceiptButton lang={lang} className="mt-4" />
      <ConversionToggle lang={lang} />
      <CountTotal lang={lang} />
    </div>
  )
}
