import { Fragment } from 'react'
import { useLumioStore } from '@/stores/lumio-store'
import { calculateKwhToMoney } from '@/utils/tariffs.utils'
import { t } from '@/i18n'

const REFERENCE_KWH = [100, 200, 300]

export const ReferenceBlock = () => {
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

  return (
    <div className="mt-3.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
      {REFERENCE_KWH.map((kwh, idx) => (
        <Fragment key={kwh}>
          <p>{idx === 0 ? `${t('receipt.reference')}: ${kwh} kWh` : `${kwh} kWh`}</p>
          <p className="text-right font-mono tabular-nums">
            S/ {calculateKwhToMoney(kwh, inputs).total.toFixed(2)}
          </p>
        </Fragment>
      ))}
    </div>
  )
}
