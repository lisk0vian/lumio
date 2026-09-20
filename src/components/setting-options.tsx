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
} from '@/utils/tariffs.utils'
import { useSettings } from '@/settings-store'
import { Input } from '@base-ui/react'
import { Toggle } from './ui/toggle'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { useTariff } from '@/tariff-store'

export const SettingOptions = () => {
  // States
  const price = useTariff((state) => state.price)
  const fee = useTariff((state) => state.fee)
  const tax = useSettings((state) => Math.round(state.tax * 100 * 100) / 100)

  // Setters del store (selectores, se piden en el render)
  const setPriceStore = useTariff((state) => state.setPrice)
  const setFeeStore = useTariff((state) => state.setFee)
  const setTaxStore = useSettings((state) => state.setTax)

  // Wrappers que parsean el string del input antes de guardarlo
  const setPrice = (val: string) => {
    const parsed = parseFloat(val)
    setPriceStore(Number.isNaN(parsed) ? 0 : parsed)
  }
  const setFee = (val: string) => {
    const parsed = parseFloat(val)
    setFeeStore(Number.isNaN(parsed) ? 0 : parsed)
  }
  const setTax = (val: string) => {
    const parsed = parseFloat(val)
    const safe = Number.isNaN(parsed) ? 0 : parsed
    setTaxStore(Math.round(safe * 100) / 100 / 100) // redondea antes de dividir
  }

  const hasTax = useSettings((state) => state.hasTax)

  return (
    <div className="w-full h-full flex flex-wrap items-center col-span-3 gap-3">
      <div className="flex gap-3">
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
      {/* Input for tax charge */}
      <div className="flex">
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
        <Toggle
          className={cn(
            'hover:none',
            'font-bold tracking-wide',
            'aria-pressed:bg-primary aria-pressed:dark:text-primary-foreground', // hasTax == true
            'bg-muted text-foreground' // hasTax == false
          )}
          pressed={hasTax}
          onPressedChange={(pressed) => {
            useSettings.setState({ hasTax: pressed })
          }}
        >
          {hasTax ? 'Incluido' : 'Excluido'}
        </Toggle>
      </div>
      <Tabs className="rounded-sm" defaultValue="mensual">
        <TabsList>
          <TabsTrigger className="" value="mensual">
            Mensual
          </TabsTrigger>
          <TabsTrigger value="bimentral">Bimestral</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

const SelectRegulator = () => {
  const regulatorId = useSettings((state) => state.regulator?.id)
  const setRegulator = useSettings().setRegulator
  const label = getValueById(regulators, regulatorId, 'name')

  return (
    <Select value={regulatorId} onValueChange={(id) => id && setRegulator(id)}>
      <SelectTrigger className="min-w-45">
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

const SelectTariff = () => {
  const regulator = useSettings((state) => state.regulator)
  const tariff = useTariff()

  const label = getValueById(tariffCategories, tariff.id, 'label')

  return (
    <Select
      value={tariff.id ?? ''}
      onValueChange={(id) => id && tariff.setTariff(id)}
    >
      <SelectTrigger className="min-w-45">
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
    <div className="flex justify-between items-center text-sm mr-3">
      <p>{label}</p>
      <Input
        className={cn(
          'border-b-2 border-foreground/40 focus:border-foreground text-right font-mono max-w-15',
          unit ? 'mx-2' : 'ml-2',
          className
        )}
        {...props}
      />
      {unit && <p>{unit}</p>}
    </div>
  )
}
