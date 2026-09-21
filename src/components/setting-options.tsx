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
import { Input } from '@base-ui/react'
import { Toggle } from './ui/toggle'
import { cn } from '@/lib/utils'
import { PeriodSegment } from './period-segment'
import { useLumioStore } from '@/stores/lumio-store'
import { t } from '@/i18n'

export const SettingOptions = ({ className }: { className?: string }) => {
  // Canonical state
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore((state) => state.publicLightingCharge)
  const igvRate = useLumioStore((state) => state.igvRate)
  const setPricePerKwhStore = useLumioStore((state) => state.setPricePerKwh)
  const setFixedChargeStore = useLumioStore((state) => state.setFixedCharge)
  const setPublicLightingStore = useLumioStore(
    (state) => state.setPublicLightingCharge
  )
  const setIgvRateStore = useLumioStore((state) => state.setIgvRate)

  const taxPercent = Math.round(igvRate * 100 * 100) / 100

  // Wrappers que parsean el string del input antes de guardarlo
  const setPrice = (val: string) => setPricePerKwhStore(parseSettingNumber(val))
  const setFee = (val: string) => setFixedChargeStore(parseSettingNumber(val))
  const setLighting = (val: string) =>
    setPublicLightingStore(parseSettingNumber(val))
  const setTax = (val: string) => setIgvRateStore(parseTaxPercent(val))

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
        value={pricePerKwh}
        min={0}
        type="number"
        onValueChange={(val) => setPrice(val)}
      />
      {/* Input for fixed charge */}
      <div className="flex items-center gap-2">
        <InputSetting
          label="fijo S/"
          type="number"
          min={0}
          value={fixedCharge}
          onValueChange={(val) => setFee(val)}
        />
        <ChargeToggle kind="fixed" />
      </div>
      <div className="flex items-center gap-2">
        <InputSetting
          label="alumbrado S/"
          type="number"
          min={0}
          value={publicLightingCharge}
          onValueChange={(val) => setLighting(val)}
        />
        <ChargeToggle kind="lighting" />
      </div>
      {/* Input for tax charge + period: wrapped together so they
          wrap as one intentional unit, never leaving Periodo orphaned */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 max-lg:w-full">
        <InputSetting
          label="IGV"
          unit="%"
          type="number"
          min={1}
          max={100}
          step={1}
          onValueChange={(val) => setTax(val)}
          value={taxPercent}
        />
        <TaxToggle />
        </div>
        <PeriodSegment />
      </div>
    </div>
  )
}

export const TaxToggle = () => {
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const setIsTaxEnabled = useLumioStore((state) => state.setIsTaxEnabled)

  return (
    <Toggle
      className={cn(
        'hover:none',
        'min-h-9 font-medium tracking-wide max-lg:min-h-11',
        'aria-pressed:bg-primary aria-pressed:text-primary-foreground', // isTaxEnabled == true
        'bg-muted text-foreground' // isTaxEnabled == false
      )}
      pressed={isTaxEnabled}
      onPressedChange={(pressed) => {
        setIsTaxEnabled(pressed)
      }}
    >
      {isTaxEnabled ? t('receipt.included') : t('receipt.excluded')}
    </Toggle>
  )
}

export const ChargeToggle = ({ kind }: { kind: 'fixed' | 'lighting' }) => {
  const isEnabled = useLumioStore((state) =>
    kind === 'fixed' ? state.isFixedChargeEnabled : state.isPublicLightingEnabled
  )
  const setIsFixed = useLumioStore((state) => state.setIsFixedChargeEnabled)
  const setIsLighting = useLumioStore(
    (state) => state.setIsPublicLightingEnabled
  )

  return (
    <Toggle
      className={cn(
        'hover:none',
        'min-h-9 font-medium tracking-wide max-lg:min-h-11',
        'aria-pressed:bg-primary aria-pressed:text-primary-foreground',
        'bg-muted text-foreground'
      )}
      pressed={isEnabled}
      onPressedChange={(pressed) => {
        if (kind === 'fixed') setIsFixed(pressed)
        else setIsLighting(pressed)
      }}
    >
      {isEnabled ? 'On' : 'Off'}
    </Toggle>
  )
}

export const SelectRegulator = ({ triggerClassName }: { triggerClassName?: string }) => {
  const regulatorId = useLumioStore((state) => state.regulatorId)
  const setRegulator = useLumioStore((state) => state.setRegulator)
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
  const regulatorId = useLumioStore((state) => state.regulatorId)
  const tariffId = useLumioStore((state) => state.tariffId)
  const setTariff = useLumioStore((state) => state.setTariff)

  const label = getValueById(tariffCategories, tariffId, 'label')

  return (
    <Select
      value={tariffId ?? ''}
      onValueChange={(id) => id && setTariff(id)}
    >
      <SelectTrigger className={cn('min-w-32', triggerClassName)}>
        <SelectValue placeholder="Select a tariff">{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {regulatorId &&
          groupTariffsByCode(
            getTariffsForRegulator(regulatorId, tariffCategories)
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
