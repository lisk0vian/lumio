import { Input } from './ui/input'
import { useSettings } from '@/settings-store'
import { useTariff } from '@/tariff-store'

export const CountTotal = ({ showResumen = false }: { showResumen?: boolean }) => {
  const price = useTariff((state) => state.price)
  const fee = useTariff((state) => state.fee)
  const tax = useSettings((state) => state.tax)
  const hasTax = useSettings((state) => state.hasTax)

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-3 border-b border-border py-5 2xl:py-6">
        <p className="text-xs whitespace-nowrap text-muted-foreground">Consumo</p>
        <p className="flex min-w-0 flex-1 items-baseline justify-end gap-2">
          <Input
            type="number"
            placeholder="0"
            className="h-auto min-w-0 flex-1 border-transparent bg-background! py-1 text-right font-mono font-medium text-[clamp(2rem,8vw,3rem)] leading-none outline-none ring-0 tabular-nums focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none 2xl:text-6xl"
          />
          <span className="font-mono text-base text-muted-foreground 2xl:text-lg">kWh</span>
        </p>
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <p className="text-xs whitespace-nowrap text-muted-foreground">Enter guarda en el historial</p>
        {showResumen ? (
          <p className="text-right font-mono text-[0.625rem] text-muted-foreground">
            S/ {price}/kWh · fijo S/ {fee} · {hasTax ? `IGV ${Math.round(tax * 100)}%` : 'sin IGV'}
          </p>
        ) : null}
      </div>
    </div>
  )
}
