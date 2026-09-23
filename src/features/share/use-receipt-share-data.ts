import { useLumioStore } from '@/stores/lumio-store'
import { tariffCategories } from '@/data/tariffs.data'
import { calculateKwhToMoney } from '@/utils/calculation.utils'
import { getTariffLabel } from '@/utils/tariff-catalog.utils'
import { formatKwh, formatMoney, formatTaxPercent } from '@/utils/format.utils'
import {
  useActiveKwh,
  useCalculationInputs,
} from '../calculator/use-calculation-inputs'
import { useTranslations, type AppLang } from '@/i18n'
import type { ReceiptLine } from './receipt-card'

export function formatEmittedAt(date: Date, lang: AppLang): string {
  // No timeZone option: Intl uses the device system zone by definition.
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

// Every derived value the share flow renders or sends: receipt lines,
// text summary and the WhatsApp fallback. Pure derivation from the store,
// so the dialog, the capture node and the text fallbacks never disagree.
export function useReceiptShareData(lang: AppLang, emittedAt: Date | null) {
  const inputs = useCalculationInputs()
  const activeKwh = useActiveKwh(inputs)
  const isFixedChargeEnabled = useLumioStore(
    (state) => state.isFixedChargeEnabled
  )
  const isPublicLightingEnabled = useLumioStore(
    (state) => state.isPublicLightingEnabled
  )
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const period = useLumioStore((state) => state.period)
  const tariffId = useLumioStore((state) => state.tariffId)
  const t = useTranslations(lang)

  const result = calculateKwhToMoney(activeKwh, inputs)
  const noData = !(activeKwh > 0)

  const taxPercent = formatTaxPercent(inputs.igvRate)
  const tariffLabel = getTariffLabel(tariffCategories, tariffId) ?? 'Personal'
  const periodLabel = t(
    period === 'bimonthly' ? 'settings.bimonthly' : 'settings.monthly'
  )

  const lines: ReceiptLine[] = [
    {
      kind: 'energy',
      label: `${t('receipt.energy')} · ${formatKwh(activeKwh)}`,
      money: formatMoney(result.energy),
    },
  ]
  if (isFixedChargeEnabled) {
    lines.push({
      kind: 'fixed',
      label: t('receipt.fixedCharge'),
      money: formatMoney(result.fixedCharge),
    })
  }
  if (isPublicLightingEnabled) {
    lines.push({
      kind: 'lighting',
      label: t('receipt.publicLighting'),
      money: formatMoney(result.publicLightingCharge),
    })
  }
  lines.push({
    kind: 'subtotal',
    label: t('receipt.subtotal'),
    money: formatMoney(result.subtotal),
  })
  lines.push({
    kind: 'igv',
    label: `${t('receipt.igv')} ${taxPercent} % · ${t(isTaxEnabled ? 'receipt.included' : 'receipt.excluded')}`,
    money: formatMoney(result.igv),
  })
  lines.push({
    kind: 'total',
    label: t('receipt.total'),
    money: formatMoney(result.total),
  })

  const summary = `Lumio · ${formatKwh(activeKwh)} → ${formatMoney(result.total)} (${t('receipt.total')}) · ${tariffLabel} · ${periodLabel}. ${t('share.estimateNote')}`

  // Readable WhatsApp text (desktop route): bold headers and total, italic
  // note, blank lines for breathing. No code fence, no dot leaders.
  const whatsappReceipt = [
    `*LUMIO · ${t('share.projection')}*`,
    `${t('share.emitted')}: ${emittedAt ? formatEmittedAt(emittedAt, lang) : ''}`,
    '',
    `*${formatKwh(activeKwh)}*`,
    '',
    ...lines.map((line) =>
      line.kind === 'total'
        ? `*${line.label} — ${line.money}*`
        : `${line.label} — ${line.money}`
    ),
    '',
    `${tariffLabel} · ${periodLabel}`,
    `_${t('share.estimateNote')}_`,
  ].join('\n')

  return {
    activeKwh,
    noData,
    tariffLabel,
    periodLabel,
    lines,
    summary,
    whatsappReceipt,
  }
}
