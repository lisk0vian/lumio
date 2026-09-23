import { Fragment } from 'react'
import { calculateKwhToMoney } from '@/utils/calculation.utils'
import { formatMoney } from '@/utils/format.utils'
import { useCalculationInputs } from './use-calculation-inputs'
import { useTranslations, type AppLang } from '@/i18n'

const REFERENCE_KWH = [100, 200, 300]

export const ReferenceBlock = ({ lang }: { lang: AppLang }) => {
  const inputs = useCalculationInputs()
  const t = useTranslations(lang)

  return (
    <div className="mt-3.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
      {REFERENCE_KWH.map((kwh, idx) => (
        <Fragment key={kwh}>
          <p>{idx === 0 ? `${t('receipt.reference')}: ${kwh} kWh` : `${kwh} kWh`}</p>
          <p className="text-right font-mono tabular-nums">
            {formatMoney(calculateKwhToMoney(kwh, inputs).total)}
          </p>
        </Fragment>
      ))}
    </div>
  )
}
