import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { calculateKwhToMoney } from '@/utils/tariffs.utils'
import { t, useActiveLang } from '@/i18n'
import { savingTips } from '@/data/tips.data'

export const SavingTip = ({ className }: { className?: string }) => {
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const igvRate = useLumioStore((state) => state.igvRate)
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  useActiveLang()
  const [index, setIndex] = useState(0)

  const tip = savingTips[index]

  const goPrev = () =>
    setIndex((i) => (i - 1 + savingTips.length) % savingTips.length)
  const goNext = () => setIndex((i) => (i + 1) % savingTips.length)

  const savings = calculateKwhToMoney(tip.kwhPerMonth, {
    pricePerKwh,
    fixedCharge: 0,
    publicLightingCharge: 0,
    igvRate,
    isFixedChargeEnabled: false,
    isPublicLightingEnabled: false,
    isTaxEnabled,
    period: 'monthly',
  }).total

  // Rail ámbar + superficie cálida: el bloque de consejos es el único
  // momento editorial de la página, así que carga el color de marca.
  return (
    <div
      className={cn(
        'mt-6 border-l-2 border-ember bg-accent/60 px-4 py-4 2xl:mt-8',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {t('tip.title')}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t('tip.prev')}
            onClick={goPrev}
            className="flex min-h-9 min-w-9 cursor-pointer items-center justify-center text-foreground max-lg:min-h-11 max-lg:min-w-11"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <p className="font-mono text-[0.625rem] text-muted-foreground">
            {index + 1} / {savingTips.length}
          </p>
          <button
            type="button"
            aria-label={t('tip.next')}
            onClick={goNext}
            className="flex min-h-9 min-w-9 cursor-pointer items-center justify-center text-foreground max-lg:min-h-11 max-lg:min-w-11"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="mt-2 min-h-11 text-base leading-snug 2xl:text-lg">
        {t(tip.textKey)}
      </p>
      <p className="mt-1.5 font-mono text-xs tabular-nums text-ember">
        &minus;{tip.kwhPerMonth.toFixed(1)} kWh · &asymp; S/ {savings.toFixed(2)}{' '}
        {t('tip.perMonth')}
      </p>
    </div>
  )
}
