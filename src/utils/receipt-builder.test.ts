import { describe, expect, it } from 'vitest'
import { buildReceipts, type ReceiptLabels } from './receipt-builder'
import type { CalculationInputs } from './calculation.utils'

// Tarifa del seed, la misma del recibo verificado de junio 2026 (Lima Norte).
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
    expect(receipts.map((r) => r.id)).toEqual([
      'energy',
      'subtotal',
      'igv',
      'total',
    ])
  })
})
