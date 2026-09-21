import { Fragment } from 'react'
import { useSettings } from '@/settings-store'
import { useTariff } from '@/tariff-store'

const REFERENCE_KWH = [100, 200, 300]

export const ReferenceBlock = () => {
  const price = useTariff((state) => state.price)
  const fee = useTariff((state) => state.fee)
  const tax = useSettings((state) => state.tax)
  const hasTax = useSettings((state) => state.hasTax)

  const rate = hasTax ? tax : 0

  return (
    <div className="mt-3.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
      {REFERENCE_KWH.map((kwh, idx) => (
        <Fragment key={kwh}>
          <p>{idx === 0 ? `Referencia: ${kwh} kWh` : `${kwh} kWh`}</p>
          <p className="text-right font-mono tabular-nums">
            S/ {(kwh * price * (1 + rate) + fee).toFixed(2)}
          </p>
        </Fragment>
      ))}
    </div>
  )
}
