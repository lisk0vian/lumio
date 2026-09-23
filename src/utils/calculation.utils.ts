// Bidirectional tariff math: kWh <-> money, memoized with an LRU cap.
// The maps dedupe the repeats every store change triggers (one recompute
// per island sharing the same inputs); copies on the way out so callers
// can't mutate the cached entry.

import type { BillingPeriod, KwhToMoneyResult } from '@/types'

export type CalculationInputs = {
  pricePerKwh: number
  fixedCharge: number
  publicLightingCharge: number
  igvRate: number
  isFixedChargeEnabled: boolean
  isPublicLightingEnabled: boolean
  isTaxEnabled: boolean
  period: BillingPeriod
}

export function sanitizeNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

export function periodMultiplier(period: BillingPeriod): number {
  return period === 'bimonthly' ? 2 : 1
}

// Calculation cache: the math is O(1), but every store change recomputes the
// same inputs once per island (calculator, receipt, level, share, tabs…).
// The maps dedupe those repeats within a session. LRU cap avoids unbounded
// growth; copies on the way out so callers can't mutate the cached entry.
const CALC_CACHE_LIMIT = 200
const kwhToMoneyCache = new Map<string, KwhToMoneyResult>()
const moneyToKwhCache = new Map<string, { kwh: number }>()

function calcKey(value: number, inputs: CalculationInputs): string {
  return [
    value,
    inputs.pricePerKwh,
    inputs.fixedCharge,
    inputs.publicLightingCharge,
    inputs.igvRate,
    inputs.isFixedChargeEnabled ? 1 : 0,
    inputs.isPublicLightingEnabled ? 1 : 0,
    inputs.isTaxEnabled ? 1 : 0,
    inputs.period,
  ].join('|')
}

function trimCalcCache<K, V>(cache: Map<K, V>): void {
  if (cache.size > CALC_CACHE_LIMIT) {
    const oldest = cache.keys().next()
    if (!oldest.done) cache.delete(oldest.value)
  }
}

/** Empties the calculation memo cache. Only needed for tests. */
export function clearCalculationCache(): void {
  kwhToMoneyCache.clear()
  moneyToKwhCache.clear()
}

type ResolvedCharges = {
  price: number
  fixed: number
  lighting: number
  rate: number
}

// The fixed/lighting/rate trio is resolved identically by both directions:
// toggles off mean zero, everything is clamped to non-negative.
function resolveCharges(inputs: CalculationInputs): ResolvedCharges {
  return {
    price: sanitizeNonNegative(inputs.pricePerKwh),
    fixed: inputs.isFixedChargeEnabled
      ? sanitizeNonNegative(inputs.fixedCharge)
      : 0,
    lighting: inputs.isPublicLightingEnabled
      ? sanitizeNonNegative(inputs.publicLightingCharge)
      : 0,
    rate: inputs.isTaxEnabled ? sanitizeNonNegative(inputs.igvRate) : 0,
  }
}

export function calculateKwhToMoney(
  kwh: number,
  inputs: CalculationInputs
): KwhToMoneyResult {
  const key = calcKey(kwh, inputs)
  const hit = kwhToMoneyCache.get(key)
  if (hit) return { ...hit }

  const safeKwh = sanitizeNonNegative(kwh)
  const { price, fixed, lighting, rate } = resolveCharges(inputs)

  const monthlySubtotal = safeKwh * price + fixed + lighting
  const monthlyIgv = monthlySubtotal * rate
  const multiplier = periodMultiplier(inputs.period)

  const subtotal = monthlySubtotal * multiplier
  const igv = monthlyIgv * multiplier

  const result: KwhToMoneyResult = {
    energy: safeKwh * price * multiplier,
    fixedCharge: fixed * multiplier,
    publicLightingCharge: lighting * multiplier,
    subtotal,
    igv,
    total: subtotal + igv,
  }
  kwhToMoneyCache.set(key, result)
  trimCalcCache(kwhToMoneyCache)
  return { ...result }
}

export function calculateMoneyToKwh(
  total: number,
  inputs: CalculationInputs
): { kwh: number } {
  const key = calcKey(total, inputs)
  const hit = moneyToKwhCache.get(key)
  if (hit) return { ...hit }

  const safeTotal = sanitizeNonNegative(total)
  const { price, fixed, lighting, rate } = resolveCharges(inputs)
  if (price === 0) {
    const zero = { kwh: 0 }
    moneyToKwhCache.set(key, zero)
    trimCalcCache(moneyToKwhCache)
    return { ...zero }
  }

  const multiplier = periodMultiplier(inputs.period)

  const monthlyTotal = safeTotal / multiplier
  const monthlyCharges = fixed + lighting

  // Exact inverse of calculateKwhToMoney, which applies the IGV to the whole
  // subtotal (energy + charges). So the IGV has to be undone *before* the
  // charges are subtracted. Subtracting first divided money by (1 + rate) and
  // left the charges taxed at the wrong step, inflating every conversion by
  // charges * rate / (price * (1 + rate)): with the base tariff that is
  // +0.815 kWh, added again on every unit switch.
  //
  // The guard is the smallest bill this tariff can produce (charges + IGV).
  // Comparing against the charges alone let smaller amounts through and
  // produced a negative consumption.
  if (monthlyTotal < monthlyCharges * (1 + rate)) {
    const zero = { kwh: 0 }
    moneyToKwhCache.set(key, zero)
    trimCalcCache(moneyToKwhCache)
    return { ...zero }
  }

  const result = { kwh: (monthlyTotal / (1 + rate) - monthlyCharges) / price }
  moneyToKwhCache.set(key, result)
  trimCalcCache(moneyToKwhCache)
  return { ...result }
}
