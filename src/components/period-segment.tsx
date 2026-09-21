import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { t } from '@/i18n'

const PERIODOS: { key: 'monthly' | 'bimonthly'; label: string }[] = [
  { key: 'monthly', label: t('settings.monthly') },
  { key: 'bimonthly', label: t('settings.bimonthly') },
]

// Shared segmented control backed by the global tariff period.
export const PeriodSegment = () => {
  const period = useLumioStore((state) => state.period)
  const setPeriod = useLumioStore((state) => state.setPeriod)

  return (
    <div className="flex">
      {PERIODOS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setPeriod(key)}
          className={cn(
            'min-h-9 cursor-pointer rounded-md px-2.5 text-xs max-lg:min-h-11',
            period === key
              ? 'bg-primary font-medium text-primary-foreground'
              : 'font-normal text-muted-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
