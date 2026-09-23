import { useMemo } from 'react'
import { useLumioStore } from '@/stores/lumio-store'
import {
  calculateMoneyToKwh,
  type CalculationInputs,
} from '@/utils/calculation.utils'
import type { I18nKey } from '@/i18n/utils'

// Single source for the tariff snapshot every island derives from.
// Each field keeps its own store subscription (same semantics as the
// previous inline blocks); the object identity is memoized so derived
// math below does not recompute on unrelated renders.
export function useCalculationInputs(): CalculationInputs {
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

  return useMemo(
    () => ({
      pricePerKwh,
      fixedCharge,
      publicLightingCharge,
      igvRate,
      isFixedChargeEnabled,
      isPublicLightingEnabled,
      isTaxEnabled,
      period,
    }),
    [
      pricePerKwh,
      fixedCharge,
      publicLightingCharge,
      igvRate,
      isFixedChargeEnabled,
      isPublicLightingEnabled,
      isTaxEnabled,
      period,
    ]
  )
}

// Canonical active consumption: the kWh side of the bidirectional
// converter, whatever the current direction is.
export function useActiveKwh(inputs: CalculationInputs): number {
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)

  return direction === 'kwh-to-money'
    ? inputKwh
    : calculateMoneyToKwh(inputMoney, inputs).kwh
}

type SummaryContent = {
  unit: 'money' | 'kwh'
  surcharges: string[]
}

// Shared by the desktop calculator and the mobile calc panel so both
// headers describe the same state with the same words.
export function getSummaryContent(args: {
  isKwhMode: boolean
  isTaxEnabled: boolean
  t: (key: I18nKey) => string
}): SummaryContent {
  const { isKwhMode, isTaxEnabled, t } = args
  return {
    unit: isKwhMode ? 'money' : 'kwh',
    surcharges: isKwhMode
      ? [
          t(isTaxEnabled ? 'calculator.withIgv' : 'calculator.withoutIgv'),
          t('calculator.netAmount'),
        ]
      : [t('calculator.estimatedConsumption')],
  }
}
