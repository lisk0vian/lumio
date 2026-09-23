// Settings input parsing: raw strings from number inputs into safe numbers.
// Empty or invalid input becomes 0 instead of NaN.

/**
 * Parses a raw settings input into a safe number.
 * Empty or invalid input becomes 0 instead of NaN.
 */
export function parseSettingNumber(val: string): number {
  const parsed = parseFloat(val)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Parses a tax percentage input (e.g. "18") into a rate (e.g. 0.18),
 * rounded to two decimals before dividing.
 */
export function parseTaxPercent(val: string): number {
  const safe = parseSettingNumber(val)
  return Math.round(safe * 100) / 100 / 100
}
