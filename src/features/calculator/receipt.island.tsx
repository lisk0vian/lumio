import type { FC } from 'react'
import { ReceiptDetails } from './receipt-details'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { buildReceipts } from '@/utils/receipt-builder'
import { useActiveKwh, useCalculationInputs } from './use-calculation-inputs'
import { getReceiptLabels } from './receipt-labels'
import { useTranslations, type AppLang } from '@/i18n'

// Receipt breakdown rows: derived from the same tariff inputs as the
// calculator core. Mounted inside an Astro-rendered section.
export const ReceiptIsland: FC<{ lang: AppLang }> = ({ lang }) => {
  const inputs = useCalculationInputs()
  const activeKwh = useActiveKwh(inputs)
  const t = useTranslations(lang)
  const enterRef = useEnterAnimation<HTMLDivElement>()

  const receipts = buildReceipts(
    activeKwh,
    inputs,
    getReceiptLabels(t)
  ).receipts

  return (
    <div ref={enterRef} className="contents">
      <ReceiptDetails receipts={receipts} />
    </div>
  )
}
