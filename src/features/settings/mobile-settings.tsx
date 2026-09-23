import type { ReactNode } from 'react'
import { useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldSweep, useFieldFeedback } from './field-feedback'
import { PeriodSegment } from './period-segment'
import { SelectRegulator, SelectTariff, TaxToggle, ChargeToggle } from './setting-options'
import { parseSettingNumber, parseTaxPercent } from '@/utils/tariffs.utils'
import { useLumioStore } from '@/stores/lumio-store'
import type { SettingFieldId } from '@/utils/animated-number.utils'
import { useTranslations, type AppLang } from '@/i18n'

// Ghost trigger: keeps the shadcn select behavior, borderless and
// right-aligned like a label/control row. Desktop triggers untouched.
const GHOST_TRIGGER =
  'w-auto border-none bg-transparent px-1 font-mono text-[0.8125rem] shadow-none max-lg:min-h-11 [&_[data-slot=select-value]]:justify-end'

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
  field,
  onChange,
}: {
  value: number
  min?: number
  step?: number
  narrow?: boolean
  field?: SettingFieldId
  onChange: (val: string) => void
}) {
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const { sweepRef, sweep, setHover, prime, settle, commit } = useFieldFeedback(field)
  const fixedOn = useLumioStore((state) => state.isFixedChargeEnabled)
  const lightingOn = useLumioStore((state) => state.isPublicLightingEnabled)
  const taxOn = useLumioStore((state) => state.isTaxEnabled)
  const enabled =
    field === 'fixed' ? fixedOn : field === 'lighting' ? lightingOn : field === 'tax' ? taxOn : true

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => {
        setHover(true)
        if (enabled) prime()
      }}
      onMouseLeave={() => {
        setHover(false)
        settle()
      }}
      className="relative inline-flex"
    >
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        step={step}
        disabled={!enabled}
        onChange={(e) => {
          sweep()
          onChange(e.target.value)
        }}
        onBlur={() => commit(wrapRef.current)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(wrapRef.current)
        }}
        className={cn(
          'min-h-11 border-b border-border bg-transparent text-right font-mono text-base font-medium tabular-nums outline-none focus:border-ember disabled:cursor-not-allowed disabled:opacity-50',
          narrow ? 'w-12' : 'w-20'
        )}
      />
      <FieldSweep sweepRef={sweepRef} />
    </span>
  )
}

export const MobileSettings = ({ lang }: { lang: AppLang }) => {
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const setPricePerKwh = useLumioStore((state) => state.setPricePerKwh)
  const setFixedCharge = useLumioStore((state) => state.setFixedCharge)
  const setPublicLightingCharge = useLumioStore(
    (state) => state.setPublicLightingCharge
  )
  const setIgvRate = useLumioStore((state) => state.setIgvRate)
  const t = useTranslations(lang)

  const taxPercent = Math.round(igvRate * 100 * 100) / 100

  return (
    <div className="flex flex-col">
      <SettingRow label={t('settings.regulator')}>
        <SelectRegulator lang={lang} triggerClassName={GHOST_TRIGGER} />
      </SettingRow>

      <SettingRow label={t('settings.tariff')}>
        <SelectTariff lang={lang} triggerClassName={GHOST_TRIGGER} />
      </SettingRow>

      <SettingRow label={t('settings.price')}>
        <span className="font-mono text-xs text-muted-foreground">S/</span>
        <UnderlineInput
          value={pricePerKwh}
          min={0}
          step={0.01}
          onChange={(val) => setPricePerKwh(parseSettingNumber(val))}
        />
      </SettingRow>

      <SettingRow label={t('settings.fixedCharge')}>
        <span className="font-mono text-xs text-muted-foreground">S/</span>
        <UnderlineInput
          value={fixedCharge}
          field="fixed"
          min={0}
          step={0.1}
          onChange={(val) => setFixedCharge(parseSettingNumber(val))}
        />
        <ChargeToggle lang={lang} kind="fixed" />
      </SettingRow>

      <SettingRow label={t('settings.publicLighting')}>
        <span className="font-mono text-xs text-muted-foreground">S/</span>
        <UnderlineInput
          value={publicLightingCharge}
          field="lighting"
          min={0}
          step={0.1}
          onChange={(val) => setPublicLightingCharge(parseSettingNumber(val))}
        />
        <ChargeToggle lang={lang} kind="lighting" />
      </SettingRow>

      <SettingRow label={t('settings.igv')}>
        <UnderlineInput
          narrow
          value={taxPercent}
          field="tax"
          min={0}
          step={1}
          onChange={(val) => setIgvRate(parseTaxPercent(val))}
        />
        <span className="font-mono text-xs text-muted-foreground">%</span>
        <TaxToggle lang={lang} />
      </SettingRow>

      <SettingRow label={t('settings.period')}>
        <PeriodSegment lang={lang} />
      </SettingRow>
    </div>
  )
}

export const MobileSettingsReset = ({ lang }: { lang: AppLang }) => {
  const resetAll = useLumioStore((state) => state.resetAll)
  const t = useTranslations(lang)

  return (
    <button
      type="button"
      onClick={() => {
        resetAll()
      }}
      className="mt-6 flex min-h-11 cursor-pointer items-center gap-2 p-0 text-left text-xs text-muted-foreground underline underline-offset-[3px]"
    >
      <RotateCcw className="size-4" aria-hidden="true" />
      {t('settings.reset')}
    </button>
  )
}
