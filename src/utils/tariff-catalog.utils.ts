// Tariff catalog lookups: regulators, groupings and custom-tariff detection.
// Pure queries over TariffCategory data, no UI code.

import type {
  BillingPeriod,
  TariffCategory,
  TariffGroup,
  VoltageLevel,
} from '@/types'

/**
 * Human-readable labels for each voltage level, based on IEC 60038.
 * Used for group headings in the UI (e.g. "BT5B – Low voltage").
 */
export const voltageLevelLabels: Record<VoltageLevel, string> = {
  low: 'Low voltage',
  medium: 'Medium voltage',
  high: 'High voltage',
  'extra-high': 'Extra-high voltage',
}

/**
 * Returns all tariff categories that belong to a given regulator.
 */
export function getTariffsForRegulator(
  regulatorId: string,
  categories: TariffCategory[]
): TariffCategory[] {
  return categories.filter((c) => c.regulatorId === regulatorId)
}

/**
 * Groups a flat list of tariff categories by code + voltageLevel,
 * e.g. all "BT5B" segments (residential, commercial, rural) become one group.
 */
export function groupTariffsByCode(
  categories: TariffCategory[]
): TariffGroup[] {
  const groups = new Map<string, TariffGroup>()

  for (const category of categories) {
    const key = `${category.code}-${category.voltageLevel}`
    const existing = groups.get(key)

    if (existing) {
      existing.items.push(category)
    } else {
      groups.set(key, {
        code: category.code,
        voltageLevel: category.voltageLevel,
        items: [category],
      })
    }
  }

  return Array.from(groups.values())
}

/** Human-readable segment label for the selected catalog tariff. */
export function getTariffLabel(
  categories: TariffCategory[],
  id: string | undefined
): string | undefined {
  return categories.find((item) => item.id === id)?.label
}

/**
 * The four tariff-owned fields: editing any of them diverges from the
 * selected catalog tariff. IGV rate and enable-toggles are global settings,
 * not part of the tariff, so they never mark it custom.
 */
export type TariffFieldValues = {
  pricePerKwh: number
  fixedCharge: number
  publicLightingCharge: number
  period: BillingPeriod
}

/**
 * True when the live values no longer match the selected catalog tariff
 * (or it doesn't exist): the UI then shows "Personalizada" instead.
 * Exact comparison is safe: setTariff copies the catalog numbers verbatim
 * and every edit funnels through the same parse helpers.
 */
export function isCustomTariff(
  values: TariffFieldValues,
  tariff: TariffCategory | undefined
): boolean {
  if (!tariff) return true
  return (
    values.pricePerKwh !== tariff.pricePerKwh ||
    values.fixedCharge !== tariff.fixedCharge ||
    values.publicLightingCharge !== tariff.publicLightingCharge ||
    values.period !== tariff.billingPeriod
  )
}
