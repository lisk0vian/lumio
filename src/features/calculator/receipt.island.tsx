import type { FC } from 'react'
import { ReceiptDetails } from './receipt-details'
import { Skeleton } from '@/components/ui/skeleton'
import { useLumioStore } from '@/stores/lumio-store'
import { useHydrated } from '@/stores/use-hydrated'
import {
  buildReceipts,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'
import type { AppLang } from '@/i18n'

// Receipt breakdown rows: derived from the same tariff inputs as the
// calculator core. Mounted inside an Astro-rendered section.
export const ReceiptIsland: FC<{ lang: AppLang }> = ({ lang }) => {
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
  const hydrated = useHydrated()

  // Skeleton con las mismas filas que el desglose real: evita el hueco
  // negro y el salto de layout mientras rehidrata el store persistido.
  if (!hydrated)
    return (
      <div
        aria-hidden="true"
        className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-2"
      >
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-20" />
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
  const activeKwh =
    direction === 'kwh-to-money'
      ? inputKwh
      : calculateMoneyToKwh(inputMoney, inputs).kwh

  const receipts = buildReceipts(activeKwh, inputs, lang).receipts

  return <ReceiptDetails receipts={receipts} />
}
