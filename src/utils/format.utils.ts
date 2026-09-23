// Pure display formatters: single source for money, energy and file-size
// text. Every inline `S/ ${n.toFixed(2)}` / `${kwh.toFixed(1)} kWh` across
// islands must funnel through here so output never drifts between views.

/** Money in soles: `S/ 22.59`. Mirrors the previous inline template. */
export function formatMoney(value: number): string {
  return `S/ ${value.toFixed(2)}`
}

/** Energy amount: `22.0 kWh`. Mirrors the previous inline template. */
export function formatKwh(value: number): string {
  return `${value.toFixed(1)} kWh`
}

/**
 * IGV rate (e.g. 0.18) -> editable percent (e.g. 18).
 * Rounded to two decimals before display, same as the settings inputs.
 */
export function formatTaxPercent(rate: number): number {
  return Math.round(rate * 100 * 100) / 100
}

/** Capture size for the share preview line: `48.2 KB` / `312 KB`. */
export function formatKb(bytes: number): string {
  return bytes < 10240
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${Math.round(bytes / 1024)} KB`
}
