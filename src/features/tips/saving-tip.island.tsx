import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { calculateKwhToMoney } from '@/utils/calculation.utils'
import { useAutoplayBar } from './use-autoplay-bar'
import { useTranslations, type AppLang } from '@/i18n'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { savingTips } from '@/data/tips.data'

const AUTOPLAY_MS = 6000
const SLIDE_PX = 14

export const SavingTip = ({
  lang,
  className,
}: {
  lang: AppLang
  className?: string
}) => {
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const igvRate = useLumioStore((state) => state.igvRate)
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const t = useTranslations(lang)
  const [index, setIndex] = useState(0)
  const enterRef = useEnterAnimation<HTMLDivElement>()

  const rootRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const slideAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const dirRef = useRef<1 | -1>(1)
  const firstRef = useRef(true)

  const tip = savingTips[index]

  const goPrev = () => {
    dirRef.current = -1
    setIndex((i) => (i - 1 + savingTips.length) % savingTips.length)
  }
  const goNext = () => {
    dirRef.current = 1
    setIndex((i) => (i + 1) % savingTips.length)
  }

  useAutoplayBar({
    rootRef,
    barRef,
    index,
    duration: AUTOPLAY_MS,
    onTick: () => {
      dirRef.current = 1
      setIndex((i) => (i + 1) % savingTips.length)
    },
  })

  const savings = calculateKwhToMoney(tip.kwhPerMonth, {
    pricePerKwh,
    fixedCharge: 0,
    publicLightingCharge: 0,
    igvRate,
    isFixedChargeEnabled: false,
    isPublicLightingEnabled: false,
    isTaxEnabled,
    period: 'monthly',
  }).total

  // Directional slide on tip change: exits toward the pressed arrow, the new
  // tip enters from the opposite side. Skipped on first paint and under
  // prefers-reduced-motion; rapid clicks cancel the previous slide.
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = contentRef.current
    if (!el || isReducedMotion()) return
    slideAnimRef.current?.cancel()
    slideAnimRef.current = animate(el, {
      opacity: [0, 1],
      x: [SLIDE_PX * dirRef.current, 0],
      duration: 250,
      ease: 'outCubic',
    })
  }, [index])

  // Pause state lives inside useAutoplayBar (hover/focus/hidden tab).

  useEffect(() => {
    return () => {
      slideAnimRef.current?.cancel()
    }
  }, [])

  // Rail ámbar + superficie cálida: el bloque de consejos es el único
  // momento editorial de la página, así que carga el color de marca.
  return (
    <div
      ref={rootRef}
      className={cn(
        'mt-4 border-l-2 border-ember bg-accent/60 px-4 py-2 2xl:mt-6',
        className
      )}
    >
      <div ref={enterRef}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {t('tip.title')}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t('tip.prev')}
              onClick={goPrev}
              className="flex min-h-8 min-w-8 cursor-pointer items-center justify-center text-foreground transition-transform active:scale-90 max-lg:min-h-11 max-lg:min-w-11"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="font-mono text-[0.625rem] text-muted-foreground">
              {index + 1} / {savingTips.length}
            </p>
            <button
              type="button"
              aria-label={t('tip.next')}
              onClick={goNext}
              className="flex min-h-8 min-w-8 cursor-pointer items-center justify-center text-foreground transition-transform active:scale-90 max-lg:min-h-11 max-lg:min-w-11"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div ref={contentRef}>
          <p className="mt-2 line-clamp-2 min-h-10 text-base leading-snug text-balance 2xl:text-lg">
            {t(tip.textKey)}
          </p>
          <p className="mt-1.5 font-mono text-xs tabular-nums text-ember">
            &minus;{tip.kwhPerMonth.toFixed(1)} kWh · &asymp; S/{' '}
            {savings.toFixed(2)} {t('tip.perMonth')}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="mt-2 h-0.5 overflow-hidden rounded-full bg-ember/15"
        >
          <div
            ref={barRef}
            style={{ transform: 'scaleX(0)' }}
            className="h-full w-full origin-left bg-ember"
          />
        </div>
      </div>
    </div>
  )
}
