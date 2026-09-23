import { describe, expect, it } from 'vitest'
import {
  formatKb,
  formatKwh,
  formatMoney,
  formatTaxPercent,
} from './format.utils'

describe('formatMoney', () => {
  it('formats soles with two decimals', () => {
    expect(formatMoney(22.5852)).toBe('S/ 22.59')
    expect(formatMoney(0)).toBe('S/ 0.00')
    expect(formatMoney(3.64)).toBe('S/ 3.64')
  })
})

describe('formatKwh', () => {
  it('formats energy with one decimal', () => {
    expect(formatKwh(22)).toBe('22.0 kWh')
    expect(formatKwh(22.05)).toBe('22.1 kWh')
  })
})

describe('formatTaxPercent', () => {
  it('converts a rate to an editable percent', () => {
    expect(formatTaxPercent(0.18)).toBe(18)
    expect(formatTaxPercent(0.185)).toBe(18.5)
  })
})

describe('formatKb', () => {
  it('uses one decimal under 10 KB and rounds above', () => {
    expect(formatKb(1024)).toBe('1.0 KB')
    expect(formatKb(51200)).toBe('50 KB')
  })
})
