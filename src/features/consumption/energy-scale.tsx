import { cn } from '@/lib/utils'
import { useTranslations, type AppLang } from '@/i18n'
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
  lang,
  activeKwh,
  className,
}: {
  lang: AppLang
  activeKwh?: number | null
  className?: string
}) => {
  const t = useTranslations(lang)
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  return (
    <p className={className}>
      {level ? t(LEVEL_LABEL_KEY[level]) : t('calculator.noData')}
    </p>
  )
}

/** Helper under the scale: `20.0 kWh · 70-140` with data, static text without. */
export const LevelHint = ({
  lang,
  activeKwh,
  className,
}: {
  lang: AppLang
  activeKwh?: number | null
  className?: string
}) => {
  const t = useTranslations(lang)
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  return (
    <p className={className}>
      {level && activeKwh != null
        ? `${activeKwh.toFixed(1)} kWh · ${getLevelRange(level)}`
        : t('calculator.writeConsumption')}
    </p>
  )
}

function getEnergyLevels(t: (key: I18nKey) => string): (EnergyBandProps & { key: string })[] {
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
export const EnergyScale = ({ lang, activeKwh }: { lang: AppLang; activeKwh?: number | null }) => {
  const t = useTranslations(lang)
  const level = activeKwh == null ? null : getConsumptionLevel(activeKwh)
  const energyLevels = getEnergyLevels(t)
  return (
    <div className="my-1.5 flex gap-0.5">
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
  // El estado activo no se apoya solo en el color: la banda activa suma
  // superficie ámbar + ring + peso y opacidad distintos (WCAG 1.4.1).
  return (
    <div
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'flex-1 px-1 py-1.5 text-center',
        isActive
          ? 'bg-accent text-accent-foreground ring-1 ring-primary/40'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <p
        className={cn(
          'text-xs leading-snug whitespace-nowrap',
          isActive ? 'font-semibold' : 'font-medium'
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 text-[0.625rem] whitespace-nowrap',
          isActive ? 'opacity-85' : 'opacity-65'
        )}
      >
        {range}
      </p>
    </div>
  )
}
