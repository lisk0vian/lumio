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
  const tariff = useTariff()

  const { tax, setTax, hasTax } = useSettings()

  return (
    <div className="w-full h-full flex items-center col-span-3 gap-3">
      <SelectRegulator />
      <SelectTariff />
      <div className="flex justify-between items-center">
        <p className="text-sm">S/ </p>
        <Input
          className="border-b-2 border-foreground/40 focus:border-foreground text-right max-w-15 mx-2 text-sm"
          type="number"
          min={0}
          value={tariff.price}
          onChange={(e) => tariff.setPrice(parseFloat(e.target.value))}
        />
        <p className="text-sm">/kWh</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm">Fijo S/ </p>
        <Input
          className="border-b-2 border-foreground/40 focus:border-foreground text-right max-w-15 ml-1 text-sm"
          type="number"
          min={0}
          value={tariff.fee}
          onChange={(e) => tariff.setFee(parseFloat(e.target.value))}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm">IVG </p>
        <Input
          className="border-b-2 border-foreground/40 focus:border-foreground text-right max-w-15 mx-2 text-sm"
          type="number"
          min={1}
          max={100}
          step={1}
          onChange={(e) => setTax(parseInt(e.target.value) / 100)}
          value={tax * 100}
        />
        <p>%</p>
      </div>
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
