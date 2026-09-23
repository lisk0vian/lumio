import { describe, expect, it } from 'vitest'
import type { TariffCategory } from '../types'
import { isCustomTariff } from './tariff-catalog.utils'

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
    expect(
      isCustomTariff({ ...catalog, pricePerKwh: 0.8 }, { ...tariff })
    ).toBe(true)
    expect(isCustomTariff({ ...catalog, fixedCharge: 0 }, { ...tariff })).toBe(
      true
    )
    expect(
      isCustomTariff({ ...catalog, publicLightingCharge: 5 }, { ...tariff })
    ).toBe(true)
    expect(
      isCustomTariff({ ...catalog, period: 'bimonthly' }, { ...tariff })
    ).toBe(true)
  })

  it('es verdadero sin tarifa seleccionada', () => {
    expect(isCustomTariff({ ...catalog }, undefined)).toBe(true)
  })
})
