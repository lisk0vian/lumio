// Pure helpers for the animejs counter (SummaryTotal) and input micro
// animations (CountTotal). No React/UI imports on purpose: unit tested in
// isolation, animation engines stay inside the island components.
export const COUNTER_MIN_DURATION = 180
export const COUNTER_MAX_DURATION = 700
export const COUNTER_MONEY_REF = 100
export const COUNTER_KWH_REF = 30

export type CounterUnit = 'money' | 'kwh'

/** Reference delta each unit normalizes against (money moves in S/, kWh in units). */
export function getCounterRef(unit: CounterUnit): number {
  return unit === 'money' ? COUNTER_MONEY_REF : COUNTER_KWH_REF
}

/**
 * Sub-linear duration so big jumps feel fast (more value per ms) and small
 * nudges stay smooth: ~200-280ms for deltas of 1-5, capped at 700ms.
 * Non-finite or non-positive input falls back to the minimum.
 */
export function getCounterDuration(delta: number, ref: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(ref) || ref <= 0 || delta <= 0) {
    return COUNTER_MIN_DURATION
  }
  const t = COUNTER_MIN_DURATION + 220 * Math.sqrt(delta / ref)
  return Math.min(Math.max(Math.round(t), COUNTER_MIN_DURATION), COUNTER_MAX_DURATION)
}

/** Big jumps (>= 1 ref) ease out harder; small ones stay soft. */
export function getCounterEasing(delta: number, ref: number): 'outExpo' | 'outCubic' {
  if (!Number.isFinite(delta) || !Number.isFinite(ref) || ref <= 0) return 'outCubic'
  return delta / ref >= 1 ? 'outExpo' : 'outCubic'
}

/** SSR-safe reduced-motion check: server prerender never matches. */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Window event linking a valid Enter commit (CountTotal) to the total flash (SummaryTotal). */
export const LUMIO_COMMIT_EVENT = 'lumio:commit-flash'

/** Settings field paired with an enable toggle (fixed/lighting charge, IGV). */
export type SettingFieldId = 'fixed' | 'lighting' | 'tax'

/** Window event fired by ChargeToggle/TaxToggle so the paired numeric field
 *  sweeps its underline in (enabled) or out (disabled). */
export const LUMIO_SETTING_EVENT = 'lumio:setting-toggle'
