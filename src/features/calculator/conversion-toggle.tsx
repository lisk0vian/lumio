import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLumioStore } from '@/stores/lumio-store'
import { isReducedMotion } from '@/utils/animated-number.utils'
import { useTranslations, type AppLang } from '@/i18n'

export const ConversionToggle = ({ lang }: { lang: AppLang }) => {
  const direction = useLumioStore((state) => state.direction)
  const setDirectionWithConversion = useLumioStore(
    (state) => state.setDirectionWithConversion
  )
  const t = useTranslations(lang)

  const barRef = useRef<HTMLSpanElement | null>(null)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const barAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const firstRef = useRef(true)

  const activeKey = direction === 'kwh-to-money' ? 'kwh-s' : 's-kwh'
  const kwhLabel = t('calculator.kwhToMoney')
  const moneyLabel = t('calculator.moneyToKwh')

  // Sliding ember indicator: tweens x + width to the active tab. offsetLeft
  // is exact against the relative list; re-runs on direction, labels
  // (language changes widths) and resize/fonts. First paint and
  // prefers-reduced-motion place it instantly.
  useEffect(() => {
    const place = (instant: boolean) => {
      const bar = barRef.current
      const btn = btnRefs.current[activeKey]
      if (!bar || !btn) return
      const x = btn.offsetLeft
      const w = btn.offsetWidth
      barAnimRef.current?.cancel()
      if (instant || isReducedMotion()) {
        bar.style.width = `${w}px`
        bar.style.transform = `translateX(${x}px)`
        return
      }
      barAnimRef.current = animate(bar, {
        x,
        width: w,
        duration: 250,
        ease: 'outCubic',
      })
    }

    place(firstRef.current)
    firstRef.current = false
    const onResize = () => place(true)
    window.addEventListener('resize', onResize)
    document.fonts?.ready.then(() => place(true)).catch(() => {})
    return () => {
      window.removeEventListener('resize', onResize)
      barAnimRef.current?.cancel()
    }
  }, [activeKey, kwhLabel, moneyLabel])

  return (
    <Tabs
      value={activeKey}
      onValueChange={(val) =>
        setDirectionWithConversion(
          val === 's-kwh' ? 'money-to-kwh' : 'kwh-to-money'
        )
      }
    >
      <TabsList
        variant="line"
        className="relative mt-3 w-full justify-start gap-8 border-y border-border py-0 2xl:mt-4"
      >
        <TabsTrigger
          ref={(el) => {
            btnRefs.current['kwh-s'] = el
          }}
          className="flex-1 rounded-none py-2 text-xs font-medium after:hidden max-lg:min-h-11"
          value="kwh-s"
        >
          {kwhLabel}
        </TabsTrigger>
        <TabsTrigger
          ref={(el) => {
            btnRefs.current['s-kwh'] = el
          }}
          className="flex-1 rounded-none py-2 text-xs font-medium after:hidden max-lg:min-h-11"
          value="s-kwh"
        >
          {moneyLabel}
        </TabsTrigger>
        <span
          ref={barRef}
          aria-hidden="true"
          style={{ width: 0 }}
          className="absolute bottom-[-1px] left-0 h-0.5 bg-ember"
        />
      </TabsList>
    </Tabs>
  )
}
