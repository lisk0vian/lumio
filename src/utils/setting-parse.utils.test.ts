import { describe, expect, it } from 'vitest'
import { parseSettingNumber, parseTaxPercent } from './setting-parse.utils'

describe('parseSettingNumber', () => {
  it('convierte texto numérico y tolera vacío o inválido como 0', () => {
    expect(parseSettingNumber('0.6144')).toBe(0.6144)
    expect(parseSettingNumber('')).toBe(0)
    expect(parseSettingNumber('abc')).toBe(0)
  })
})

describe('parseTaxPercent', () => {
  it('convierte un porcentaje editable en tasa', () => {
    expect(parseTaxPercent('18')).toBe(0.18)
    expect(parseTaxPercent('18.5')).toBe(0.185)
    expect(parseTaxPercent('')).toBe(0)
  })
})
