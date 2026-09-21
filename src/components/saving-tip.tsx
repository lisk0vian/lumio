import { cn } from '@/lib/utils'
import { useSettings } from '@/settings-store'
import { useTariff } from '@/tariff-store'

const TIP_TEXT = 'Cambia 6 focos incandescentes por LED'
const TIP_KWH = 46
const TIP_COUNT = 6

export const SavingTip = ({ className }: { className?: string }) => {
  const price = useTariff((state) => state.price)
  const tax = useSettings((state) => state.tax)
  const hasTax = useSettings((state) => state.hasTax)

  const savings = TIP_KWH * price * (1 + (hasTax ? tax : 0))

  return (
    <div className={cn('mt-6 bg-muted px-4 py-4 2xl:mt-8', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Consejo para ahorrar
        </p>
        <p className="font-mono text-[0.625rem] text-muted-foreground">1 / {TIP_COUNT}</p>
      </div>
      <p className="mt-2 text-base leading-snug 2xl:text-lg">{TIP_TEXT}</p>
      <p className="mt-1.5 font-mono text-xs tabular-nums text-primary">
        &minus;{TIP_KWH.toFixed(1)} kWh · &asymp; S/ {savings.toFixed(2)} menos al mes
      </p>
    </div>
  )
}
