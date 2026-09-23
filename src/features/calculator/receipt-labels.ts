import type { I18nKey } from '@/i18n/utils'
import type { ReceiptLabels } from '@/utils/tariffs.utils'

// Translated receipt row labels. The pure `buildReceipts` helper receives
// these instead of importing i18n itself, keeping utils UI-free.
export function getReceiptLabels(t: (key: I18nKey) => string): ReceiptLabels {
  return {
    energy: t('receipt.energy'),
    fixedCharge: t('receipt.fixedCharge'),
    publicLighting: t('receipt.publicLighting'),
    subtotal: t('receipt.subtotal'),
    igv: t('receipt.igv'),
    included: t('receipt.included'),
    excluded: t('receipt.excluded'),
    total: t('receipt.total'),
  }
}
