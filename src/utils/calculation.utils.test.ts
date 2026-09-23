import { describe, expect, it } from 'vitest'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  type CalculationInputs,
} from './calculation.utils'

// Tarifa del seed, la misma del recibo verificado de junio 2026 (Lima Norte):
// 22.0 kWh + fijo 3.64 + alumbrado 0.10 = S/ 19.14 sin IGV, S/ 22.59 con IGV.
export const baseInputs: CalculationInputs = {
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
    expect(
      calculateMoneyToKwh(MIN_BILL + 0.01, baseInputs).kwh
    ).toBeGreaterThan(0)
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
