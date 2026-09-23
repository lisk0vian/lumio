import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { regulators } from '@/data/tariffs.data'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select'
import { isReducedMotion } from '@/utils/animated-number.utils'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

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
      <SelectContent
        alignItemWithTrigger={false}
        className="min-w-60 max-w-[92vw]"
        id="regulator-options"
      >
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
