import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { useAnimateOnChange } from '@/hooks/use-animate-on-change'
import { useTranslations, type AppLang } from '@/i18n'

// Shared segmented control backed by the global tariff period.
export const PeriodSegment = ({ lang }: { lang: AppLang }) => {
  const period = useLumioStore((state) => state.period)
  const setPeriod = useLumioStore((state) => state.setPeriod)
  const t = useTranslations(lang)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const PERIODOS: { key: 'monthly' | 'bimonthly'; label: string }[] = [
    { key: 'monthly', label: t('settings.monthly') },
    { key: 'bimonthly', label: t('settings.bimonthly') },
  ]

  // The newly active button pulses, skipped on first paint.
  useAnimateOnChange(
    () => {
      const active = rootRef.current?.children[period === 'monthly' ? 0 : 1]
      return active instanceof HTMLElement ? active : null
    },
    { scale: [1, 1.08, 1], duration: 150, ease: 'outCubic' },
    [period]
  )

  return (
    <div ref={rootRef} className="flex">
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
