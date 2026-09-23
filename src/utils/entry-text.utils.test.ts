import { describe, expect, it } from 'vitest'
import {
  formatEntryText,
  parseEntryText,
  sanitizeEntryText,
} from './entry-text.utils'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  type CalculationInputs,
} from './calculation.utils'

// Seed local duplicado del de calculation.utils.test: este archivo verifica
// que el campo oculte el residuo de punto flotante tras varias conversiones.
const baseInputs: CalculationInputs = {
  pricePerKwh: 0.7,
  fixedCharge: 3.64,
  publicLightingCharge: 0.1,
  igvRate: 0.18,
  isFixedChargeEnabled: true,
  isPublicLightingEnabled: true,
  isTaxEnabled: true,
  period: 'monthly',
}

describe('sanitizeEntryText', () => {
  it('normaliza la coma y deja un solo separador', () => {
    expect(sanitizeEntryText('22,5')).toBe('22.5')
    expect(sanitizeEntryText('22.')).toBe('22.')
    expect(sanitizeEntryText('1.2.3')).toBe('1.23')
    expect(sanitizeEntryText('abc')).toBe('')
    expect(sanitizeEntryText('1a2')).toBe('12')
    expect(sanitizeEntryText('')).toBe('')
  })
})

describe('parseEntryText', () => {
  it('acepta punto y coma como separador decimal', () => {
    expect(parseEntryText('22.5')).toBe(22.5)
    expect(parseEntryText('22,5')).toBe(22.5)
    expect(parseEntryText('0.7')).toBe(0.7)
  })

  it('tolera los estados intermedios de tecleo', () => {
    // El caso que rompía: teclear "22." tiene que dejar 22 sin comerse el
    // punto que se acaba de escribir.
    expect(parseEntryText('22.')).toBe(22)
    expect(parseEntryText('22.5')).toBe(22.5)
    expect(parseEntryText('0.')).toBe(0)
  })

  it('trata la entrada vacía o inválida como 0', () => {
    expect(parseEntryText('')).toBe(0)
    expect(parseEntryText('.')).toBe(0)
    expect(parseEntryText('abc')).toBe(0)
  })

  it('ignora el signo: el campo no admite negativos', () => {
    expect(parseEntryText('-5')).toBe(5)
  })
})

describe('formatEntryText', () => {
  it('redondea a 2 decimales y quita ceros de relleno', () => {
    expect(formatEntryText(22)).toBe('22')
    expect(formatEntryText(22.5)).toBe('22.5')
    expect(formatEntryText(22.5852)).toBe('22.59')
    expect(formatEntryText(115.70574)).toBe('115.71')
  })

  it('oculta el residuo de punto flotante tras varias conversiones', () => {
    let kwh = 22
    for (let i = 0; i < 4; i++) {
      const { total } = calculateKwhToMoney(kwh, baseInputs)
      kwh = calculateMoneyToKwh(total, baseInputs).kwh
    }
    // El valor guardado acumula residuo (22.000000000000007); el campo no
    // debe mostrarlo.
    expect(formatEntryText(kwh)).toBe('22')
  })

  it('devuelve cadena vacía sin valor utilizable', () => {
    expect(formatEntryText(0)).toBe('')
    expect(formatEntryText(-1)).toBe('')
    expect(formatEntryText(Number.NaN)).toBe('')
  })
})
