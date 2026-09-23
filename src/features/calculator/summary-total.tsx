import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { isReducedMotion } from '@/utils/animated-number.utils'
import { useAnimatedNumber } from './use-animated-number'

type SummaryTotalProp = {
  total: number
  unit?: 'money' | 'kwh'
  surchages?: string[] // tax, charge, fee, etc.
}

export const SummaryTotal = ({ total, unit = 'money', surchages }: SummaryTotalProp) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const labelRef = useRef<HTMLParagraphElement | null>(null)
  const firstLabelRef = useRef(true)
  const display = useAnimatedNumber(total, unit, titleRef)
  const label = surchages?.join(' · ') ?? ''

  // The surcharges line (e.g. Con/Sin IGV) follows the settings toggles:
  // fade + slide when its text changes, instant under reduced motion.
  useEffect(() => {
    if (firstLabelRef.current) {
      firstLabelRef.current = false
      return
    }
    const el = labelRef.current
    if (!el || isReducedMotion()) return
    animate(el, { opacity: [0, 1], y: [4, 0], duration: 150, ease: 'outCubic' })
  }, [label])

  return (
    <div>
      <h1
        ref={titleRef}
        className="font-mono text-[clamp(3.5rem,12vw,4rem)] leading-[1.06] font-medium tracking-tight tabular-nums lg:text-[clamp(2.5rem,4vw,3.5rem)] 2xl:text-[4rem]"
      >
        {unit === 'money' ? `S/ ${display.toFixed(2)}` : `${display.toFixed(1)} kWh`}
      </h1>
      <p ref={labelRef} className="font-mono text-xs font-medium text-ember">{label}</p>
    </div>
  )
}
