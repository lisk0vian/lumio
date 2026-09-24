import { useRef } from 'react'
import { useAnimateOnChange } from '@/hooks/use-animate-on-change'
import { formatKwh, formatMoney } from '@/utils/format.utils'
import { useAnimatedNumber } from './use-animated-number'

type SummaryTotalProp = {
  total: number
  unit?: 'money' | 'kwh'
  surcharges?: string[] // tax, charge, fee, etc.
}

export const SummaryTotal = ({
  total,
  unit = 'money',
  surcharges,
}: SummaryTotalProp) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const labelRef = useRef<HTMLParagraphElement | null>(null)
  const display = useAnimatedNumber(total, unit, titleRef)
  const label = surcharges?.join(' · ') ?? ''

  // The surcharges line (e.g. Con/Sin IGV) follows the settings toggles:
  // fade + slide when its text changes, instant under reduced motion.
  useAnimateOnChange(
    () => labelRef.current,
    { opacity: [0, 1], y: [4, 0], duration: 150, ease: 'outCubic' },
    [label]
  )

  return (
    <div>
      <h1
        ref={titleRef}
        className="font-mono text-[clamp(3.5rem,12vw,4rem)] leading-[1.06] font-medium tracking-tight tabular-nums lg:text-[clamp(2.5rem,4vw,3.5rem)] 2xl:text-[4rem]"
      >
        {unit === 'money' ? formatMoney(display) : formatKwh(display)}
      </h1>
      <p ref={labelRef} className="font-mono text-xs font-medium text-ember">
        {label}
      </p>
    </div>
  )
}
