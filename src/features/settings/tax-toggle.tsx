import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import {
  isReducedMotion,
  LUMIO_SETTING_EVENT,
} from '@/utils/animated-number.utils'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

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
          new CustomEvent(LUMIO_SETTING_EVENT, {
            detail: { field: 'tax', enabled: pressed },
          })
        )
      }}
    >
      <span ref={textRef} className="inline-block">
        {isTaxEnabled ? t('receipt.included') : t('receipt.excluded')}
      </span>
    </Toggle>
  )
}
