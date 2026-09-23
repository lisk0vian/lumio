import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { tariffCategories } from '@/data/tariffs.data'
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
} from '@/utils/tariff-catalog.utils'
import { isReducedMotion } from '@/utils/animated-number.utils'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'

export const SelectTariff = ({
  lang,
  triggerClassName,
}: {
  lang: AppLang
  triggerClassName?: string
}) => {
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
    <Select value={tariffId ?? ''} onValueChange={(id) => id && setTariff(id)}>
      <SelectTrigger
        className={cn('min-w-32', triggerClassName)}
        aria-controls="tariff-options"
        aria-label={t('settings.tariff')}
      >
        <span ref={nameRef} className="flex min-w-0 flex-1 truncate text-left">
          {display}
        </span>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="min-w-60 max-w-[92vw]"
        id="tariff-options"
      >
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
