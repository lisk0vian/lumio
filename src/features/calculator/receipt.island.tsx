import type { FC } from 'react'
import { ReceiptDetails } from './receipt-details'
import { useLumioStore } from '@/stores/lumio-store'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
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
  const enterRef = useEnterAnimation<HTMLDivElement>()

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

  return (
    <div ref={enterRef} className="contents">
      <ReceiptDetails receipts={receipts} />
    </div>
  )
}
