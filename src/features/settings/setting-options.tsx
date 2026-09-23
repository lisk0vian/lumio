import {
  parseSettingNumber,
  parseTaxPercent,
} from '@/utils/setting-parse.utils'
import { formatTaxPercent } from '@/utils/format.utils'
import { InputSetting } from './input-setting'
import { TaxToggle } from './tax-toggle'
import { ChargeToggle } from './charge-toggle'
import { SelectRegulator } from './select-regulator'
import { SelectTariff } from './select-tariff'
import { cn } from '@/lib/utils'
import { PeriodSegment } from './period-segment'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

export const SettingOptions = ({
  lang,
  className,
}: {
  lang: AppLang
  className?: string
}) => {
  // Canonical state
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const setPricePerKwhStore = useLumioStore((state) => state.setPricePerKwh)
  const setFixedChargeStore = useLumioStore((state) => state.setFixedCharge)
  const setPublicLightingStore = useLumioStore(
    (state) => state.setPublicLightingCharge
  )
  const setIgvRateStore = useLumioStore((state) => state.setIgvRate)
  const t = useTranslations(lang)

  const taxPercent = formatTaxPercent(igvRate)

  // Wrappers que parsean el string del input antes de guardarlo
  const setPrice = (val: string) => setPricePerKwhStore(parseSettingNumber(val))
  const setFee = (val: string) => setFixedChargeStore(parseSettingNumber(val))
  const setLighting = (val: string) =>
    setPublicLightingStore(parseSettingNumber(val))
  const setTax = (val: string) => setIgvRateStore(parseTaxPercent(val))

  return (
    <div
      className={cn(
        'mt-auto flex w-full flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3 pb-2 text-xs text-muted-foreground 2xl:pt-4',
        className
      )}
    >
      <div className="flex min-w-56 flex-1 flex-wrap gap-2 max-lg:flex-col max-lg:items-stretch">
        <SelectRegulator
          lang={lang}
          triggerClassName="min-w-44 flex-1 max-w-60"
        />
        <SelectTariff lang={lang} triggerClassName="min-w-44 flex-1 max-w-60" />
      </div>
      {/* Input for price per Kwh */}
      <InputSetting
        label="S/"
        unit="/kWh"
        aria-label={t('settings.price')}
        value={pricePerKwh}
        min={0}
        type="number"
        onValueChange={(val) => setPrice(val)}
      />
      {/* Input for fixed charge */}
      <div className="flex flex-none items-center gap-2">
        <InputSetting
          label={t('settings.fixedShort')}
          field="fixed"
          type="number"
          min={0}
          value={fixedCharge}
          onValueChange={(val) => setFee(val)}
        />
        <ChargeToggle lang={lang} kind="fixed" />
      </div>
      <div className="flex flex-none items-center gap-2">
        <InputSetting
          label={t('settings.lightingShort')}
          field="lighting"
          type="number"
          min={0}
          value={publicLightingCharge}
          onValueChange={(val) => setLighting(val)}
        />
        <ChargeToggle lang={lang} kind="lighting" />
      </div>
      {/* Input for tax charge + period: wrapped together so they
          wrap as one intentional unit, never leaving Periodo orphaned */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 max-lg:w-full">
          <InputSetting
            label="IGV"
            unit="%"
            aria-label={t('settings.igv')}
            field="tax"
            type="number"
            min={1}
            max={100}
            step={1}
            onValueChange={(val) => setTax(val)}
            value={taxPercent}
          />
          <TaxToggle lang={lang} />
        </div>
        <PeriodSegment lang={lang} />
      </div>
    </div>
  )
}
