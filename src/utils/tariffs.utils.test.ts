import { describe, expect, it } from 'vitest'
import type { TariffCategory } from '../types'
import {
  buildReceipts,
  calculateKwhToMoney,
  calculateMoneyToKwh,
  formatEntryText,
  isCustomTariff,
  parseEntryText,
  sanitizeEntryText,
  type CalculationInputs,
  type ReceiptLabels,
} from './tariffs.utils'

// Tarifa del seed, la misma del recibo verificado de junio 2026 (Lima Norte):
// 22.0 kWh + fijo 3.64 + alumbrado 0.10 = S/ 19.14 sin IGV, S/ 22.59 con IGV.
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

const CHARGES = 3.64 + 0.1
/** Boleta mínima posible: los cargos más su IGV. */
const MIN_BILL = CHARGES * 1.18

describe('calculateMoneyToKwh', () => {
  it('es la inversa exacta de calculateKwhToMoney', () => {
    for (const kwh of [1, 7.5, 22, 22.35, 70, 115.7, 300, 1234.56]) {
      const { total } = calculateKwhToMoney(kwh, baseInputs)
      expect(calculateMoneyToKwh(total, baseInputs).kwh).toBeCloseTo(kwh, 9)
    }
  })

  it('no acumula deriva al cambiar de unidad repetidamente', () => {
    let kwh = 22
    for (let i = 0; i < 10; i++) {
      const { total } = calculateKwhToMoney(kwh, baseInputs)
      kwh = calculateMoneyToKwh(total, baseInputs).kwh
    }
    // La inversa anterior sumaba +0.815 kWh por cambio: 10 cambios daban ~30.15.
    expect(kwh).toBeCloseTo(22, 9)
  })

  it('invierte el recibo verificado de junio 2026', () => {
    const { total } = calculateKwhToMoney(22, baseInputs)
    expect(total).toBeCloseTo(22.5852, 4)
    expect(calculateMoneyToKwh(total, baseInputs).kwh).toBeCloseTo(22, 9)
  })

  it('devuelve el consumo que corresponde al importe escrito', () => {
    // S/ 22.59 es lo que la persona lee en su boleta.
    const { kwh } = calculateMoneyToKwh(22.59, baseInputs)
    expect(kwh).toBeCloseTo(22.0058, 3)
    // Y al volver, la boleta reconstruida coincide con lo que se escribió.
    expect(calculateKwhToMoney(kwh, baseInputs).total).toBeCloseTo(22.59, 2)
  })

  it('nunca devuelve consumo negativo por debajo de la boleta mínima', () => {
    for (const money of [0, 1, 4, 4.4, MIN_BILL - 0.01]) {
      expect(calculateMoneyToKwh(money, baseInputs).kwh).toBe(0)
    }
    // Justo por encima del mínimo ya hay consumo.
    expect(calculateMoneyToKwh(MIN_BILL + 0.01, baseInputs).kwh).toBeGreaterThan(0)
  })

  it('sin precio no hay inversa', () => {
    const inputs = { ...baseInputs, pricePerKwh: 0 }
    expect(calculateMoneyToKwh(50, inputs).kwh).toBe(0)
  })

  it('respeta el IGV desactivado', () => {
    const inputs = { ...baseInputs, isTaxEnabled: false }
    const { total } = calculateKwhToMoney(22, inputs)
    expect(total).toBeCloseTo(19.14, 4)
    expect(calculateMoneyToKwh(total, inputs).kwh).toBeCloseTo(22, 9)
  })

  it('respeta la facturación bimestral', () => {
    const inputs = { ...baseInputs, period: 'bimonthly' as const }
    const { total } = calculateKwhToMoney(22, inputs)
    expect(total).toBeCloseTo(45.1704, 4)
    expect(calculateMoneyToKwh(total, inputs).kwh).toBeCloseTo(22, 9)
  })
})

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

describe('buildReceipts', () => {
  const labels: ReceiptLabels = {
    energy: 'Energía',
    fixedCharge: 'Cargo fijo',
    publicLighting: 'Alumbrado público',
    subtotal: 'Subtotal',
    igv: 'IGV',
    included: 'Incluido',
    excluded: 'Excluido',
    total: 'Total',
  }

  it('asigna ids estables en orden con todos los cargos', () => {
    const { receipts, total } = buildReceipts(22, baseInputs, labels)
    expect(receipts.map((r) => r.id)).toEqual([
      'energy',
      'fixed',
      'lighting',
      'subtotal',
      'igv',
      'total',
    ])
    expect(receipts.at(-1)?.money).toBe(total)
  })

  it('omite los ids opcionales cuando sus cargos están apagados', () => {
    const { receipts } = buildReceipts(
      22,
      {
        ...baseInputs,
        isFixedChargeEnabled: false,
        isPublicLightingEnabled: false,
      },
      labels
    )
    expect(receipts.map((r) => r.id)).toEqual(['energy', 'subtotal', 'igv', 'total'])
  })
})

describe('isCustomTariff', () => {
  const catalog = {
    pricePerKwh: 0.7,
    fixedCharge: 3.64,
    publicLightingCharge: 0.1,
    period: 'monthly',
  } as const
  const tariff: TariffCategory = {
    id: 'osinergmin-bt5b-residential',
    regulatorId: 'osinergmin',
    code: 'BT5B',
    voltageLevel: 'low',
    segment: 'residential',
    label: 'Residencial',
    pricePerKwh: 0.7,
    fixedCharge: 3.64,
    publicLightingCharge: 0.1,
    verified: true,
    billingPeriod: 'monthly',
  }

  it('es falso con los valores intactos de la tarifa', () => {
    expect(isCustomTariff({ ...catalog }, { ...tariff })).toBe(false)
  })

  it('es verdadero al editar cualquier campo propio de la tarifa', () => {
    expect(isCustomTariff({ ...catalog, pricePerKwh: 0.8 }, { ...tariff })).toBe(true)
    expect(isCustomTariff({ ...catalog, fixedCharge: 0 }, { ...tariff })).toBe(true)
    expect(isCustomTariff({ ...catalog, publicLightingCharge: 5 }, { ...tariff })).toBe(true)
    expect(isCustomTariff({ ...catalog, period: 'bimonthly' }, { ...tariff })).toBe(true)
  })

  it('es verdadero sin tarifa seleccionada', () => {
    expect(isCustomTariff({ ...catalog }, undefined)).toBe(true)
  })
})
