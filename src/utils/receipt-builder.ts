// Receipt row assembly from a calculation result. Labels arrive translated
// from the caller so this pure module never imports i18n.

import type { Receipt } from '@/types'
import {
  calculateKwhToMoney,
  sanitizeNonNegative,
  type CalculationInputs,
} from './calculation.utils'

/** Translated row labels for `buildReceipts`. Supplied by the caller so this
 *  pure module never imports i18n. */
export type ReceiptLabels = {
  energy: string
  fixedCharge: string
  publicLighting: string
  subtotal: string
  igv: string
  included: string
  excluded: string
  total: string
}

export function buildReceipts(
  kwh: number,
  inputs: CalculationInputs,
  labels: ReceiptLabels
): { receipts: Receipt[]; total: number } {
  const result = calculateKwhToMoney(kwh, inputs)
  const receipts: Receipt[] = [
    {
      id: 'energy',
      label: `${labels.energy} · ${sanitizeNonNegative(kwh).toFixed(1)} kWh`,
      money: result.energy,
    },
  ]

  if (inputs.isFixedChargeEnabled) {
    receipts.push({
      id: 'fixed',
      label: labels.fixedCharge,
      money: result.fixedCharge,
    })
  }
  if (inputs.isPublicLightingEnabled) {
    receipts.push({
      id: 'lighting',
      label: labels.publicLighting,
      money: result.publicLightingCharge,
    })
  }

  receipts.push({
    id: 'subtotal',
    label: labels.subtotal,
    money: result.subtotal,
  })
  receipts.push({
    id: 'igv',
    label: `${labels.igv} · ${inputs.isTaxEnabled ? labels.included : labels.excluded}`,
    money: result.igv,
  })
  receipts.push({ id: 'total', label: labels.total, money: result.total })

  return { receipts, total: result.total }
}
