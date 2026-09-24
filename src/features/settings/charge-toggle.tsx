import { useRef } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { LUMIO_SETTING_EVENT } from '@/utils/animated-number.utils'
import { useAnimateOnChange } from '@/hooks/use-animate-on-change'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

export const ChargeToggle = ({
  lang,
  kind,
}: {
  lang: AppLang
  kind: 'fixed' | 'lighting'
}) => {
  const isEnabled = useLumioStore((state) =>
    kind === 'fixed'
      ? state.isFixedChargeEnabled
      : state.isPublicLightingEnabled
  )
  const setIsFixed = useLumioStore((state) => state.setIsFixedChargeEnabled)
  const setIsLighting = useLumioStore(
    (state) => state.setIsPublicLightingEnabled
  )
  const t = useTranslations(lang)
  const chargeLabel = t(
    kind === 'fixed' ? 'settings.fixedCharge' : 'settings.publicLighting'
  )
  const stateLabel = t(isEnabled ? 'receipt.included' : 'receipt.excluded')
  const iconRef = useRef<HTMLSpanElement | null>(null)

  // Icon swap pops in, skipped on first paint.
  useAnimateOnChange(
    () => iconRef.current,
    { scale: [0.6, 1], duration: 180, ease: 'outCubic' },
    [isEnabled]
  )

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
          new CustomEvent(LUMIO_SETTING_EVENT, {
            detail: { field: kind, enabled: pressed },
          })
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
