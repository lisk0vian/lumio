import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { regulators, tariffCategories } from '@/data/tariffs.data'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import {
  getTariffsForRegulator,
  groupTariffsByCode,
  isCustomTariff,
  parseSettingNumber,
  parseTaxPercent,
} from '@/utils/tariffs.utils'
import { formatTaxPercent } from '@/utils/format.utils'
import { isReducedMotion, LUMIO_SETTING_EVENT, type SettingFieldId } from '@/utils/animated-number.utils'
import { FieldSweep, useFieldFeedback } from './field-feedback'
import { Input } from '@base-ui/react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { PeriodSegment } from './period-segment'
import { Power, PowerOff } from 'lucide-react'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

export const SettingOptions = ({ lang, className }: { lang: AppLang; className?: string }) => {
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
        <SelectRegulator lang={lang} triggerClassName="min-w-44 flex-1 max-w-60" />
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

export const TaxToggle = ({ lang }: { lang: AppLang }) => {
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const setIsTaxEnabled = useLumioStore((state) => state.setIsTaxEnabled)
  const t = useTranslations(lang)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const firstRef = useRef(true)

  // Incluido/Excluido swaps: fade + slide, skipped on first paint.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = textRef.current
    if (!el || isReducedMotion()) return
    animate(el, { opacity: [0, 1], y: [4, 0], duration: 120, ease: 'outCubic' })
  }, [isTaxEnabled])

  return (
    <Toggle
      className={cn(
        'hover:none',
        'cursor-pointer',
        'min-h-8 font-medium tracking-wide max-lg:min-h-11',
        'aria-pressed:bg-primary aria-pressed:text-primary-foreground', // isTaxEnabled == true
        'bg-muted text-muted-foreground' // isTaxEnabled == false (atenuado: se lee "apagado")
      )}
      pressed={isTaxEnabled}
      onPressedChange={(pressed) => {
        setIsTaxEnabled(pressed)
        window.dispatchEvent(
          new CustomEvent(LUMIO_SETTING_EVENT, { detail: { field: 'tax', enabled: pressed } })
        )
      }}
    >
      <span ref={textRef} className="inline-block">
        {isTaxEnabled ? t('receipt.included') : t('receipt.excluded')}
      </span>
    </Toggle>
  )
}

export const ChargeToggle = ({ lang, kind }: { lang: AppLang; kind: 'fixed' | 'lighting' }) => {
  const isEnabled = useLumioStore((state) =>
    kind === 'fixed' ? state.isFixedChargeEnabled : state.isPublicLightingEnabled
  )
  const setIsFixed = useLumioStore((state) => state.setIsFixedChargeEnabled)
  const setIsLighting = useLumioStore(
    (state) => state.setIsPublicLightingEnabled
  )
  const t = useTranslations(lang)
  const chargeLabel = t(kind === 'fixed' ? 'settings.fixedCharge' : 'settings.publicLighting')
  const stateLabel = t(isEnabled ? 'receipt.included' : 'receipt.excluded')
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const firstRef = useRef(true)

  // Icon swap pops in, skipped on first paint.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = iconRef.current
    if (!el || isReducedMotion()) return
    animate(el, { scale: [0.6, 1], duration: 180, ease: 'outCubic' })
  }, [isEnabled])

  return (
    <Toggle
      className={cn(
        'hover:none',
        'cursor-pointer',
        'min-h-8 min-w-8 font-medium tracking-wide max-lg:min-h-11 max-lg:min-w-11',
        'aria-pressed:bg-primary aria-pressed:text-primary-foreground',
        'bg-muted text-muted-foreground'
      )}
      pressed={isEnabled}
      onPressedChange={(pressed) => {
        if (kind === 'fixed') setIsFixed(pressed)
        else setIsLighting(pressed)
        window.dispatchEvent(
          new CustomEvent(LUMIO_SETTING_EVENT, { detail: { field: kind, enabled: pressed } })
        )
      }}
      aria-label={`${chargeLabel} ${stateLabel}`}
      title={`${chargeLabel} ${stateLabel}`}
    >
      {isEnabled ? (
        <span ref={iconRef} className="inline-flex">
          <Power className="size-4" aria-hidden="true" />
        </span>
      ) : (
        <span ref={iconRef} className="inline-flex">
          <PowerOff className="size-4" aria-hidden="true" />
        </span>
      )}
    </Toggle>
  )
}

export const SelectRegulator = ({
  lang,
  triggerClassName,
}: {
  lang: AppLang
  triggerClassName?: string
}) => {
  const t = useTranslations(lang)
  const regulatorId = useLumioStore((state) => state.regulatorId)
  const setRegulator = useLumioStore((state) => state.setRegulator)
  const nameRef = useRef<HTMLSpanElement | null>(null)
  const firstRef = useRef(true)
  const name = regulators.find((r) => r.id === regulatorId)?.name ?? ''

  // Trigger text crossfades when the regulator changes.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = nameRef.current
    if (!el || isReducedMotion()) return
    animate(el, { opacity: [0.3, 1], duration: 120, ease: 'outCubic' })
  }, [name])

  return (
    <Select value={regulatorId} onValueChange={(id) => id && setRegulator(id)}>
      <SelectTrigger
        className={cn('min-w-32', triggerClassName)}
        aria-controls="regulator-options"
        aria-label={t('settings.regulator')}
      >
        <span ref={nameRef} className="flex min-w-0 flex-1 truncate text-left">
          {name}
        </span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-60 max-w-[92vw]" id="regulator-options">
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

export const SelectTariff = ({ lang, triggerClassName }: { lang: AppLang; triggerClassName?: string }) => {
  const regulatorId = useLumioStore((state) => state.regulatorId)
  const tariffId = useLumioStore((state) => state.tariffId)
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const period = useLumioStore((state) => state.period)
  const setTariff = useLumioStore((state) => state.setTariff)
  const t = useTranslations(lang)
  const tariff = tariffCategories.find((item) => item.id === tariffId)
  const nameRef = useRef<HTMLSpanElement | null>(null)
  const firstRef = useRef(true)

  // Editing any tariff-owned field diverges from the catalog entry: the
  // trigger then reads Personalizada until a tariff is picked again.
  const custom = isCustomTariff(
    { pricePerKwh, fixedCharge, publicLightingCharge, period },
    tariff
  )
  const display = custom
    ? t('settings.customTariff')
    : tariff
      ? `${tariff.code} · ${tariff.label}`
      : ''

  // Trigger text crossfades on tariff switches, including into Personalizada.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = nameRef.current
    if (!el || isReducedMotion()) return
    animate(el, { opacity: [0.3, 1], duration: 120, ease: 'outCubic' })
  }, [display])

  return (
    <Select
      value={tariffId ?? ''}
      onValueChange={(id) => id && setTariff(id)}
    >
      <SelectTrigger
        className={cn('min-w-32', triggerClassName)}
        aria-controls="tariff-options"
        aria-label={t('settings.tariff')}
      >
        <span ref={nameRef} className="flex min-w-0 flex-1 truncate text-left">
          {display}
        </span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="min-w-60 max-w-[92vw]" id='tariff-options'>
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
  field?: SettingFieldId
}

const InputSetting = ({
  label,
  unit,
  className,
  field,
  onValueChange,
  onBlur,
  onKeyDown,
  ...props
}: InputSettingProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const { sweepRef, sweep, setHover, prime, settle, commit } = useFieldFeedback(field)
  const fixedOn = useLumioStore((state) => state.isFixedChargeEnabled)
  const lightingOn = useLumioStore((state) => state.isPublicLightingEnabled)
  const taxOn = useLumioStore((state) => state.isTaxEnabled)
  const enabled =
    field === 'fixed' ? fixedOn : field === 'lighting' ? lightingOn : field === 'tax' ? taxOn : true

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => {
        setHover(true)
        if (enabled) prime()
      }}
      onMouseLeave={() => {
        setHover(false)
        settle()
      }}
      className="flex flex-none items-center gap-2 text-xs max-lg:mr-0 max-lg:w-full"
    >
      <p className="whitespace-nowrap">{label}</p>
      <span className="relative ml-auto flex items-center gap-2">
        <Input
          aria-label={[label, unit].filter(Boolean).join(' ')}
          className={cn(
            'h-7 max-w-16 border-b-2 border-border text-right font-mono tabular-nums focus:border-ember disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
          disabled={props.disabled ?? !enabled}
          onValueChange={(...args) => {
            sweep()
            onValueChange?.(...args)
          }}
          onBlur={(event) => {
            commit(wrapRef.current)
            onBlur?.(event)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit(wrapRef.current)
            onKeyDown?.(event)
          }}
        />
        <FieldSweep sweepRef={sweepRef} />
        {unit && <p className="whitespace-nowrap">{unit}</p>}
      </span>
    </div>
  )
}
