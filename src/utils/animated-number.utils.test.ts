import { describe, expect, it } from 'vitest'
import {
  COUNTER_MAX_DURATION,
  COUNTER_MIN_DURATION,
  getCounterDuration,
  getCounterEasing,
  getCounterRef,
} from './animated-number.utils'

describe('getCounterDuration', () => {
  it('devuelve el mínimo para deltas nulos o inválidos', () => {
    expect(getCounterDuration(0, 100)).toBe(COUNTER_MIN_DURATION)
    expect(getCounterDuration(-5, 100)).toBe(COUNTER_MIN_DURATION)
    expect(getCounterDuration(Number.NaN, 100)).toBe(COUNTER_MIN_DURATION)
    expect(getCounterDuration(10, 0)).toBe(COUNTER_MIN_DURATION)
  })

  it('delta chico ≈ 200-280ms (suave) con ref money', () => {
    expect(getCounterDuration(1, 100)).toBeGreaterThanOrEqual(180)
    expect(getCounterDuration(5, 100)).toBeLessThanOrEqual(280)
  })

  it('crece de forma sub-lineal y respeta el tope', () => {
    const mid = getCounterDuration(100, 100)
    const big = getCounterDuration(10000, 100)
    expect(mid).toBeGreaterThan(getCounterDuration(5, 100))
    expect(big).toBe(COUNTER_MAX_DURATION)
    expect(getCounterDuration(1e9, 30)).toBe(COUNTER_MAX_DURATION)
    expect(mid).toBeLessThanOrEqual(COUNTER_MAX_DURATION)
  })
})

describe('getCounterEasing', () => {
  it('usa outExpo en saltos grandes y outCubic en chicos', () => {
    expect(getCounterEasing(150, 100)).toBe('outExpo')
    expect(getCounterEasing(100, 100)).toBe('outExpo')
    expect(getCounterEasing(5, 100)).toBe('outCubic')
    expect(getCounterEasing(Number.NaN, 100)).toBe('outCubic')
  })
})

describe('getCounterRef', () => {
  it('normaliza money y kWh por separado', () => {
    expect(getCounterRef('money')).toBe(100)
    expect(getCounterRef('kwh')).toBe(30)
  })
})
