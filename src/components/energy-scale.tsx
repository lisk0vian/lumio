import { cn } from '@/lib/utils'
import { t } from '@/i18n'
import type { I18nKey } from '@/i18n/utils'

// Approximate reference bands for a Lima household (kWh/month).
// Rough reference, not an official OSINERGMIN band table --
// to refine, change the `max` values here only.
export type ConsumptionLevelKey = 'low' | 'normal' | 'high' | 'extra-high'

const LEVEL_BANDS: { key: ConsumptionLevelKey; max: number; range: string }[] =
  [
    { key: 'low', max: 70, range: '< 70' },
    { key: 'normal', max: 140, range: '70-140' },
    { key: 'high', max: 250, range: '140-250' },
    { key: 'extra-high', max: Infinity, range: '> 250' },
  ]

export const LEVEL_LABEL_KEY: Record<ConsumptionLevelKey, I18nKey> = {
  low: 'scale.low',
  normal: 'scale.normal',
  high: 'scale.high',
  'extra-high': 'scale.extraHigh',
}

/** Band for a consumption value, or null when there is no data (kwh <= 0). */
export function getConsumptionLevel(kwh: number): ConsumptionLevelKey | null {
  if (!Number.isFinite(kwh) || kwh <= 0) return null
  return LEVEL_BANDS.find((band) => kwh < band.max)?.key ?? 'extra-high'
}

/** Display range (e.g. `70-140`) for a level key. */
export function getLevelRange(level: ConsumptionLevelKey): string {
  return LEVEL_BANDS.find((band) => band.key === level)?.range ?? ''
}

/** Big title for the level block: level name with data, `Sin datos` without. */
export const LevelTitle = ({
  activeKwh,
  className,
}: {
  activeKwh?: number | null
  className?: string
}) => {
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  return (
    <p className={className}>
      {level ? t(LEVEL_LABEL_KEY[level]) : t('calculator.noData')}
    </p>
  )
}

/** Helper under the scale: `20.0 kWh · 70-140` with data, static text without. */
export const LevelHint = ({
  activeKwh,
  className,
}: {
  activeKwh?: number | null
  className?: string
}) => {
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  return (
    <p className={className}>
      {level && activeKwh != null
        ? `${activeKwh.toFixed(1)} kWh · ${getLevelRange(level)}`
        : t('calculator.writeConsumption')}
    </p>
  )
}

function getEnergyLevels(): (EnergyBandProps & { key: string })[] {
  return [
    {
      key: 'low',
      label: t('scale.low'),
      range: '< 70',
    },
    {
      key: 'normal',
      label: t('scale.normal'),
      range: '70-140',
    },
    {
      key: 'high',
      label: t('scale.high'),
      range: '140-250',
    },
    {
      key: 'extra-high',
      label: t('scale.extraHigh'),
      range: '> 250',
    },
  ]
}
export const EnergyScale = ({ activeKwh }: { activeKwh?: number | null }) => {
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  const energyLevels = getEnergyLevels()
  return (
    <div className="my-3 flex gap-0.5">
      {energyLevels.map(({ key, label, range }) => (
        <EnergyBand
          key={key}
          label={label}
          range={range}
          isActive={level !== null && key === level}
        />
      ))}
    </div>
  )
}

type EnergyBandProps = {
  label: string
  range: string
  isActive?: boolean
}

const EnergyBand = ({ label, range, isActive }: EnergyBandProps) => {
  return (
    <div
      className={cn(
        'flex-1 px-1 py-2.5 text-center',
        isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
      )}
    >
      <p className="text-xs leading-snug font-medium whitespace-nowrap">{label}</p>
      <p className="mt-0.5 text-[0.625rem] whitespace-nowrap opacity-65">{range}</p>
    </div>
  )
}
