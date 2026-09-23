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

/**
 * Filters free-typed entry text down to digits and a single decimal
 * separator, normalizing a comma to a dot ("22,5" -> "22.5").
 *
 * Needed because the amount/kWh field has to stay a *text* input: a
 * controlled number input rewrites its own value on every keystroke, so the
 * trailing separator of a half-typed "22." gets erased and the next digit
 * lands in the wrong place ("22.5" became "225").
 */
export function sanitizeEntryText(text: string): string {
    let sanitized = '';
    let hasSeparator = false;

    for (const char of text.replace(/,/g, '.')) {
        if (char >= '0' && char <= '9') {
            sanitized += char;
        } else if (char === '.' && !hasSeparator) {
            hasSeparator = true;
            sanitized += char;
        }
    }

    return sanitized;
}

/**
 * Entry text -> number. Anything not yet a usable amount (empty, "0", "0.",
 * a lone separator, text) becomes 0, so intermediate keystrokes never throw
 * off the derived hint. A stray minus sign is dropped rather than negating:
 * this field only accepts non-negative values.
 */
export function parseEntryText(text: string): number {
    const parsed = Number.parseFloat(sanitizeEntryText(text));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Number -> entry text, rounded to 2 decimals with trailing zeros trimmed.
 * Used only when the field is filled from the outside (unit switch, reset,
 * rehydration): without it, a correct conversion like 22.5852 would surface
 * as "22.5852", and repeated switches could expose float residue such as
 * "22.000000000000007".
 */
export function formatEntryText(value: number): string {
    if (!Number.isFinite(value) || value <= 0) return '';
    return String(Number(value.toFixed(2)));
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

export function calculateKwhToMoney(
  kwh: number,
  inputs: CalculationInputs
): KwhToMoneyResult {
  const key = calcKey(kwh, inputs)
  const hit = kwhToMoneyCache.get(key)
  if (hit) return { ...hit }

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
  const price = sanitizeNonNegative(inputs.pricePerKwh)
  if (price === 0) {
    const zero = { kwh: 0 }
    moneyToKwhCache.set(key, zero)
    trimCalcCache(moneyToKwhCache)
    return { ...zero }
  }

  const fixed = inputs.isFixedChargeEnabled
    ? sanitizeNonNegative(inputs.fixedCharge)
    : 0
  const lighting = inputs.isPublicLightingEnabled
    ? sanitizeNonNegative(inputs.publicLightingCharge)
    : 0
  const rate = inputs.isTaxEnabled ? sanitizeNonNegative(inputs.igvRate) : 0
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

export function buildReceipts(
  kwh: number,
  inputs: CalculationInputs,
  lang?: AppLang
): { receipts: Receipt[]; total: number } {
  const result = calculateKwhToMoney(kwh, inputs)
  const receipts: Receipt[] = [
    { id: 'energy', label: `${translate(lang, 'receipt.energy')} · ${sanitizeNonNegative(kwh).toFixed(1)} kWh`, money: result.energy },
  ]

  if (inputs.isFixedChargeEnabled) {
    receipts.push({ id: 'fixed', label: translate(lang, 'receipt.fixedCharge'), money: result.fixedCharge })
  }
  if (inputs.isPublicLightingEnabled) {
    receipts.push({ id: 'lighting', label: translate(lang, 'receipt.publicLighting'), money: result.publicLightingCharge })
  }

  receipts.push({ id: 'subtotal', label: translate(lang, 'receipt.subtotal'), money: result.subtotal })
  receipts.push({
    id: 'igv',
    label: `${translate(lang, 'receipt.igv')} · ${inputs.isTaxEnabled ? translate(lang, 'receipt.included') : translate(lang, 'receipt.excluded')}`,
    money: result.igv,
  })
  receipts.push({ id: 'total', label: translate(lang, 'receipt.total'), money: result.total })

  return { receipts, total: result.total }
}
