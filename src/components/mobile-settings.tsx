import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PeriodSegment } from './period-segment'
import { SelectRegulator, SelectTariff, TaxToggle } from './setting-options'
import { parseSettingNumber, parseTaxPercent } from '@/utils/tariffs.utils'
import { useTariff } from '@/tariff-store'
import { useSettings } from '@/settings-store'

// Ghost trigger: keeps the shadcn select behavior, borderless and
// right-aligned like a label/control row. Desktop triggers untouched.
const GHOST_TRIGGER =
  'w-auto border-none bg-transparent px-1 font-mono text-[0.8125rem] shadow-none [&_[data-slot=select-value]]:justify-end'

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border py-3">
      <p className="text-sm whitespace-nowrap">{label}</p>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{children}</div>
    </div>
  )
}

function UnderlineInput({
  value,
  min,
  step,
  narrow,
  onChange,
}: {
  value: number
  min?: number
  step?: number
  narrow?: boolean
  onChange: (val: string) => void
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      min={min}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'min-h-11 border-b border-foreground/25 bg-transparent text-right font-mono text-base font-medium tabular-nums outline-none focus:border-foreground',
        narrow ? 'w-12' : 'w-20'
      )}
    />
  )
}

export const MobileSettings = () => {
  const price = useTariff((state) => state.price)
  const fee = useTariff((state) => state.fee)
  const tax = useSettings((state) => state.tax)
  const setPrice = useTariff((state) => state.setPrice)
  const setFee = useTariff((state) => state.setFee)
  const setTax = useSettings((state) => state.setTax)

  const taxPercent = Math.round(tax * 100 * 100) / 100

  return (
    <div className="flex flex-col">
      <SettingRow label="Regulador">
        <SelectRegulator triggerClassName={GHOST_TRIGGER} />
      </SettingRow>

      <SettingRow label="Tarifa">
        <SelectTariff triggerClassName={GHOST_TRIGGER} />
      </SettingRow>

      <SettingRow label="Precio por kWh">
        <span className="font-mono text-xs text-muted-foreground">S/</span>
        <UnderlineInput
          value={price}
          min={0}
          step={0.01}
          onChange={(val) => setPrice(parseSettingNumber(val))}
        />
      </SettingRow>

      <SettingRow label="Cargo fijo">
        <span className="font-mono text-xs text-muted-foreground">S/</span>
        <UnderlineInput
          value={fee}
          min={0}
          step={0.1}
          onChange={(val) => setFee(parseSettingNumber(val))}
        />
      </SettingRow>

      <SettingRow label="IGV">
        <UnderlineInput
          narrow
          value={taxPercent}
          min={0}
          step={1}
          onChange={(val) => setTax(parseTaxPercent(val))}
        />
        <span className="font-mono text-xs text-muted-foreground">%</span>
        <TaxToggle />
      </SettingRow>

      <SettingRow label="Periodo">
        <PeriodSegment />
      </SettingRow>
    </div>
  )
}

export const MobileSettingsReset = () => {
  const resetTariff = useTariff((state) => state.reset)
  const resetSettings = useSettings((state) => state.reset)

  return (
    <button
      type="button"
      onClick={() => {
        resetTariff()
        resetSettings()
      }}
      className="mt-6 min-h-11 cursor-pointer p-0 text-left text-xs text-muted-foreground underline underline-offset-[3px]"
    >
      restablecer valores
    </button>
  )
}
