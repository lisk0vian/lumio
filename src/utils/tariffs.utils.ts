// Pure helper functions for working with tariff data.
// No React/UI code here on purpose -- these can be unit tested in isolation
// and reused by whatever component ends up consuming them.

import type { BillingPeriod, KwhToMoneyResult, Receipt, Regulator, TariffCategory, TariffGroup, VoltageLevel } from "../types";
import { ui, defaultLang, type AppLang } from "../i18n/ui";

function translate(lang: AppLang | undefined, key: keyof typeof ui.es): string {
  const active = lang ?? defaultLang
  return ui[active][key] ?? ui[defaultLang][key]
}

/**
 * Human-readable labels for each voltage level, based on IEC 60038.
 * Used for group headings in the UI (e.g. "BT5B – Low voltage").
 */
export const voltageLevelLabels: Record<VoltageLevel, string> = {
    low: "Low voltage",
    medium: "Medium voltage",
    high: "High voltage",
    "extra-high": "Extra-high voltage",
};

/**
 * Returns all tariff categories that belong to a given regulator.
 */
export function getTariffsForRegulator(
    regulatorId: string,
    categories: TariffCategory[]
): TariffCategory[] {
    return categories.filter((c) => c.regulatorId === regulatorId);
}

/**
 * Groups a flat list of tariff categories by code + voltageLevel,
 * e.g. all "BT5B" segments (residential, commercial, rural) become one group.
 */
export function groupTariffsByCode(categories: TariffCategory[]): TariffGroup[] {
    const groups = new Map<string, TariffGroup>();

    for (const category of categories) {
        const key = `${category.code}-${category.voltageLevel}`;
        const existing = groups.get(key);

        if (existing) {
            existing.items.push(category);
        } else {
            groups.set(key, {
                code: category.code,
                voltageLevel: category.voltageLevel,
                items: [category],
            });
        }
    }

    return Array.from(groups.values());
}

/**
 * Parses a raw settings input into a safe number.
 * Empty or invalid input becomes 0 instead of NaN.
 */
export function parseSettingNumber(val: string): number {
    const parsed = parseFloat(val);
    return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses a tax percentage input (e.g. "18") into a rate (e.g. 0.18),
 * rounded to two decimals before dividing.
 */
export function parseTaxPercent(val: string): number {
    const safe = parseSettingNumber(val);
    return Math.round(safe * 100) / 100 / 100;
}
export function getValueById<T extends { id: string }>(
  items: T[],
  id: string | undefined,
  key: keyof T
): string | undefined {
  return items.find((item) => item.id === id)?.[key] as string | undefined;
}

/**
 * Builds the receipt breakdown rows (plus Total) from the active tariff
 * settings. Placeholder values until the real calculation is wired;
 * shared by the desktop layout and the mobile tabs so both show the same.
 * @deprecated Use buildReceipts with canonical inputs instead.
 */
export function buildReceiptBreakdown(
    fee: number,
    hasTax: boolean,
    tax: number
): { receipts: Receipt[]; total: number } {
    const base: Receipt[] = [
        { label: "Energía · 14 kWh", money: 13.2 },
        { label: "Cargo Fijo · Mensual", money: fee },
        { label: "Sub Total · Sin IGV", money: 13 },
        { label: `IGV · ${hasTax ? "Incluido" : "Excluido"}`, money: tax },
    ];
    const total = base.reduce((acc, { money }) => acc + money, 0);

    return { receipts: [...base, { label: 'Total', money: total }], total };
}

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

export function calculateKwhToMoney(
  kwh: number,
  inputs: CalculationInputs
): KwhToMoneyResult {
  const safeKwh = sanitizeNonNegative(kwh)
  const price = sanitizeNonNegative(inputs.pricePerKwh)
  const fixed = inputs.isFixedChargeEnabled
    ? sanitizeNonNegative(inputs.fixedCharge)
    : 0
  const lighting = inputs.isPublicLightingEnabled
    ? sanitizeNonNegative(inputs.publicLightingCharge)
    : 0
  const rate = inputs.isTaxEnabled ? sanitizeNonNegative(inputs.igvRate) : 0

  const monthlySubtotal = safeKwh * price + fixed + lighting
  const monthlyIgv = monthlySubtotal * rate
  const multiplier = periodMultiplier(inputs.period)

  const subtotal = monthlySubtotal * multiplier
  const igv = monthlyIgv * multiplier

  return {
    energy: safeKwh * price * multiplier,
    fixedCharge: fixed * multiplier,
    publicLightingCharge: lighting * multiplier,
    subtotal,
    igv,
    total: subtotal + igv,
  }
}

export function calculateMoneyToKwh(
  total: number,
  inputs: CalculationInputs
): { kwh: number } {
  const safeTotal = sanitizeNonNegative(total)
  const price = sanitizeNonNegative(inputs.pricePerKwh)
  if (price === 0) return { kwh: 0 }

  const fixed = inputs.isFixedChargeEnabled
    ? sanitizeNonNegative(inputs.fixedCharge)
    : 0
  const lighting = inputs.isPublicLightingEnabled
    ? sanitizeNonNegative(inputs.publicLightingCharge)
    : 0
  const rate = inputs.isTaxEnabled ? sanitizeNonNegative(inputs.igvRate) : 0
  const multiplier = periodMultiplier(inputs.period)

  const monthlyTotal = safeTotal / multiplier
  const monthlyFixed = fixed + lighting
  if (monthlyTotal < monthlyFixed) return { kwh: 0 }

  return { kwh: (monthlyTotal - monthlyFixed) / (price * (1 + rate)) }
}

export function buildReceipts(
  kwh: number,
  inputs: CalculationInputs,
  lang?: AppLang
): { receipts: Receipt[]; total: number } {
  const result = calculateKwhToMoney(kwh, inputs)
  const receipts: Receipt[] = [
    { label: `${translate(lang, 'receipt.energy')} · ${sanitizeNonNegative(kwh).toFixed(1)} kWh`, money: result.energy },
  ]

  if (inputs.isFixedChargeEnabled) {
    receipts.push({ label: translate(lang, 'receipt.fixedCharge'), money: result.fixedCharge })
  }
  if (inputs.isPublicLightingEnabled) {
    receipts.push({ label: translate(lang, 'receipt.publicLighting'), money: result.publicLightingCharge })
  }

  receipts.push({ label: translate(lang, 'receipt.subtotal'), money: result.subtotal })
  receipts.push({
    label: `${translate(lang, 'receipt.igv')} · ${inputs.isTaxEnabled ? translate(lang, 'receipt.included') : translate(lang, 'receipt.excluded')}`,
    money: result.igv,
  })
  receipts.push({ label: translate(lang, 'receipt.total'), money: result.total })

  return { receipts, total: result.total }
}
