import { regulators, tariffCategories } from '@/data/tariffs.data'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  getValueById,
  getTariffsForRegulator,
  groupTariffsByCode,
  parseSettingNumber,
  parseTaxPercent,
} from '@/utils/tariffs.utils'
import { useSettings } from '@/settings-store'
import { Input } from '@base-ui/react'
import { Toggle } from './ui/toggle'
import { cn } from '@/lib/utils'
import { PeriodSegment } from './period-segment'
import { useTariff } from '@/tariff-store'

export const SettingOptions = ({ className }: { className?: string }) => {
  // States
  const price = useTariff((state) => state.price)
  const fee = useTariff((state) => state.fee)
  const tax = useSettings((state) => Math.round(state.tax * 100 * 100) / 100)

  // Setters del store (selectores, se piden en el render)
  const setPriceStore = useTariff((state) => state.setPrice)
  const setFeeStore = useTariff((state) => state.setFee)
  const setTaxStore = useSettings((state) => state.setTax)

  // Wrappers que parsean el string del input antes de guardarlo
  const setPrice = (val: string) => setPriceStore(parseSettingNumber(val))
  const setFee = (val: string) => setFeeStore(parseSettingNumber(val))
  const setTax = (val: string) => setTaxStore(parseTaxPercent(val))

  return (
    <div
      className={cn(
        'mt-auto flex justify-between w-full flex-wrap items-center gap-x-3 gap-y-3 border-t border-border pt-7 pb-2 text-xs text-muted-foreground 2xl:pt-10',
        className
      )}
    >
      <div className="flex gap-3 max-lg:flex-col max-lg:items-stretch">
        <SelectRegulator />
        <SelectTariff />
      </div>
      {/* Input for price per Kwh */}
      <InputSetting
        label="S/"
        unit="/kwh"
        value={price}
        min={0}
        type="number"
        onValueChange={(val) => setPrice(val)}
      />
      {/* Input for fixed charge */}
      <InputSetting
        label="fijo S/"
        type="number"
        min={0}
        value={fee}
        onValueChange={(val) => setFee(val)}
      />
      <InputSetting
        label="alumbrado S/"
        type="number"
        min={0}
        value={fee}
        onValueChange={(val) => setFee(val)}
      />
      {/* Input for tax charge + period: wrapped together so they
          wrap as one intentional unit, never leaving Periodo orphaned */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 max-lg:w-full">
        <InputSetting
          label="IVG"
          unit="%"
          type="number"
          min={1}
          max={100}
          step={1}
          onValueChange={(val) => setTax(val)}
          value={tax}
        />
        <TaxToggle />
        </div>
        <PeriodSegment />
      </div>
    </div>
  )
}

export const TaxToggle = () => {
  const hasTax = useSettings((state) => state.hasTax)

  return (
    <Toggle
      className={cn(
        'hover:none',
        'min-h-9 font-medium tracking-wide max-lg:min-h-11',
        'aria-pressed:bg-primary aria-pressed:text-primary-foreground', // hasTax == true
        'bg-muted text-foreground' // hasTax == false
      )}
      pressed={hasTax}
      onPressedChange={(pressed) => {
        useSettings.setState({ hasTax: pressed })
      }}
    >
      {hasTax ? 'Incluido' : 'Excluido'}
    </Toggle>
  )
}

export const SelectRegulator = ({ triggerClassName }: { triggerClassName?: string }) => {
  const regulatorId = useSettings((state) => state.regulator?.id)
  const setRegulator = useSettings().setRegulator
  const label = getValueById(regulators, regulatorId, 'name')

  return (
    <Select value={regulatorId} onValueChange={(id) => id && setRegulator(id)}>
      <SelectTrigger className={cn('min-w-32', triggerClassName)}>
        <SelectValue placeholder="Select a regulator">{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {regulators.map((regulator, idx) => (
          <SelectGroup key={regulator.countryCode}>
            <SelectLabel>{regulator.countryCode}</SelectLabel>
            <SelectItem key={regulator.id + idx} value={regulator.id}>
              {regulator.name}
            </SelectItem>
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

export const SelectTariff = ({ triggerClassName }: { triggerClassName?: string }) => {
  const regulator = useSettings((state) => state.regulator)
  const tariff = useTariff()

  const label = getValueById(tariffCategories, tariff.id, 'label')

  return (
    <Select
      value={tariff.id ?? ''}
      onValueChange={(id) => id && tariff.setTariff(id)}
    >
      <SelectTrigger className={cn('min-w-32', triggerClassName)}>
        <SelectValue placeholder="Select a tariff">{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {regulator &&
          groupTariffsByCode(
            getTariffsForRegulator(regulator.id, tariffCategories)
          ).map(({ code, items, voltageLevel }) => (
            <SelectGroup key={code}>
              <SelectLabel>
                {code} - {voltageLevel}
              </SelectLabel>
              {items.map(({ label, pricePerKwh, id }) => (
                <SelectItem key={id} value={id}>
                  {label} ({pricePerKwh.toFixed(2)})
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  )
}

type InputSettingProps = React.ComponentProps<typeof Input> & {
  label: string
  unit?: string
}

const InputSetting = ({
  label,
  unit,
  className,
  ...props
}: InputSettingProps) => {
  return (
    <div className="flex items-center gap-2 text-sm max-lg:mr-0 max-lg:w-full">
      <p className="whitespace-nowrap">{label}</p>
      <span className="ml-auto flex items-center gap-2">
        <Input
          className={cn(
            'max-w-16 border-b-2 border-foreground/40 text-right font-mono tabular-nums focus:border-foreground',
            className
          )}
          {...props}
        />
        {unit && <p className="whitespace-nowrap">{unit}</p>}
      </span>
    </div>
  )
}
