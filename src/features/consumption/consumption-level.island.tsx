import type { FC } from 'react'
import { EnergyScale, LevelHint, LevelTitle } from './energy-scale'
import { useLumioStore } from '@/stores/lumio-store'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { calculateMoneyToKwh } from '@/utils/tariffs.utils'
import type { AppLang } from '@/i18n'

// Right-column consumption level: derives from the same tariff inputs as
// the calculator, but lives in its own layout slot, so it is its own island.
// Mounted inside an Astro-rendered section.
export const LevelBlock: FC<{ lang: AppLang }> = ({ lang }) => {
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const isFixedChargeEnabled = useLumioStore(
    (state) => state.isFixedChargeEnabled
  )
  const isPublicLightingEnabled = useLumioStore(
    (state) => state.isPublicLightingEnabled
  )
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const period = useLumioStore((state) => state.period)
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)
  const enterRef = useEnterAnimation<HTMLDivElement>()

  const inputs = {
    pricePerKwh,
    fixedCharge,
    publicLightingCharge,
    igvRate,
    isFixedChargeEnabled,
    isPublicLightingEnabled,
    isTaxEnabled,
    period,
  }
  const activeKwh =
    direction === 'kwh-to-money'
      ? inputKwh
      : calculateMoneyToKwh(inputMoney, inputs).kwh

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
