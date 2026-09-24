import type { FC } from 'react'
import { EnergyScale, LevelHint, LevelTitle } from './energy-scale'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import {
  useActiveKwh,
  useCalculationInputs,
} from '../calculator/use-calculation-inputs'
import type { AppLang } from '@/i18n'

// Right-column consumption level: derives from the same tariff inputs as
// the calculator, but lives in its own layout slot, so it is its own island.
// Mounted inside an Astro-rendered section.
export const LevelBlock: FC<{ lang: AppLang }> = ({ lang }) => {
  const inputs = useCalculationInputs()
  const activeKwh = useActiveKwh(inputs)
  const enterRef = useEnterAnimation<HTMLDivElement>()

  return (
    // display:contents keeps a single island root without adding layout.
    <div ref={enterRef} className="contents">
      <LevelTitle
        lang={lang}
        activeKwh={activeKwh}
        className="mt-1 mb-2 text-[1.25rem] leading-tight 2xl:text-[1.5rem]"
      />
      <EnergyScale lang={lang} activeKwh={activeKwh} />
      <LevelHint
        lang={lang}
        activeKwh={activeKwh}
        className="mt-1 text-xs leading-relaxed text-muted-foreground"
      />
    </div>
  )
}
