import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Share2 } from 'lucide-react'
import { useLumioStore } from '@/stores/lumio-store'
import { tariffCategories } from '@/data/tariffs.data'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  getValueById,
} from '@/utils/tariffs.utils'
import { useTranslations, type AppLang } from '@/i18n'
import { ReceiptCard, type ReceiptLine } from './receipt-card'

type ShareStatus = 'idle' | 'working' | 'error'

type SnapdomApi = {
  preCapture: () => void;
  (
    node: HTMLElement,
    options?: Record<string, unknown>
  ): Promise<{ toBlob: (options?: Record<string, unknown>) => Promise<Blob> }>
}

let snapdomPromise: Promise<SnapdomApi> | null = null
let preCaptureArmed = false

// bundle-conditional: SnapDOM only loads on first share intent, never in the
// initial bundle. preCapture() warms the engine on hover/focus so the real
// click captures faster (perceived performance).
async function ensureSnapdom(): Promise<SnapdomApi> {
  if (!snapdomPromise) {
    snapdomPromise = import('@zumer/snapdom').then(
      (mod) => mod.snapdom as SnapdomApi
    )
  }
  const snapdom = await snapdomPromise
  if (!preCaptureArmed) {
    preCaptureArmed = true
    snapdom.preCapture()
  }
  return snapdom
}

function formatEmittedAt(date: Date, lang: AppLang): string {
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

const money = (value: number): string => `S/ ${value.toFixed(2)}`

export const ShareReceiptButton = ({ lang, className }: { lang: AppLang; className?: string }) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<ShareStatus>('idle')
  const [emittedAt, setEmittedAt] = useState(() => new Date())
  const t = useTranslations(lang)

  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const isFixedChargeEnabled = useLumioStore(
    (state) => state.isFixedChargeEnabled
  )
  const isPublicLightingEnabled = useLumioStore(
    (state) => state.isPublicLightingEnabled
  )
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const period = useLumioStore((state) => state.period)
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)
  const tariffId = useLumioStore((state) => state.tariffId)

  const inputs = {
    pricePerKwh,
    fixedCharge,
    publicLightingCharge,
    igvRate,
    isFixedChargeEnabled,
    isPublicLightingEnabled,
    isTaxEnabled,
    period,
  }
  const isKwhMode = direction === 'kwh-to-money'
  const activeKwh = isKwhMode
    ? inputKwh
    : calculateMoneyToKwh(inputMoney, inputs).kwh
  const result = calculateKwhToMoney(activeKwh, inputs)
  const noData = !(activeKwh > 0)

  const taxPercent = Math.round(igvRate * 100 * 100) / 100
  const tariffLabel =
    getValueById(tariffCategories, tariffId, 'label') ?? 'Personal'
  const periodLabel = t(
    period === 'bimonthly' ? 'settings.bimonthly' : 'settings.monthly'
  )

  const lines: ReceiptLine[] = [
    {
      kind: 'energy',
      label: `${t('receipt.energy')} · ${activeKwh.toFixed(1)} kWh`,
      money: money(result.energy),
    },
  ]
  if (isFixedChargeEnabled) {
    lines.push({
      kind: 'fixed',
      label: t('receipt.fixedCharge'),
      money: money(result.fixedCharge),
    })
  }
  if (isPublicLightingEnabled) {
    lines.push({
      kind: 'lighting',
      label: t('receipt.publicLighting'),
      money: money(result.publicLightingCharge),
    })
  }
  lines.push({
    kind: 'subtotal',
    label: t('receipt.subtotal'),
    money: money(result.subtotal),
  })
  lines.push({
    kind: 'igv',
    label: `${t('receipt.igv')} ${taxPercent} % · ${t(isTaxEnabled ? 'receipt.included' : 'receipt.excluded')}`,
    money: money(result.igv),
  })
  lines.push({
    kind: 'total',
    label: t('receipt.total'),
    money: money(result.total),
  })

  const warmSnapdom = () => {
    ensureSnapdom().catch(() => {
      snapdomPromise = null
    })
  }

  const handleShare = async () => {
    if (noData || status === 'working') return
    const node = nodeRef.current
    if (!node) return
    const now = new Date()
    // Flush so the capture reads the fresh timestamp, not the last render.
    flushSync(() => {
      setEmittedAt(now)
      setStatus('working')
    })
    try {
      await document.fonts.ready
      const snapdom = await ensureSnapdom()
      const capture = await snapdom(node, {
        scale: 2.5,
        dpr: 1,
        backgroundColor: '#faf9f4',
        embedFonts: 'auto',
      })
      const blob = await capture.toBlob({ format: 'png' })
      const file = new File(
        [blob],
        `lumio-boleta-${Math.round(activeKwh)}kwh.png`,
        { type: 'image/png' }
      )
      if (
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: 'Lumio' })
      } else {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = file.name
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 4000)
      }
      setStatus('idle')
    } catch (error) {
      // Dismissing the native sheet aborts: back to idle, not an error.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('idle')
      } else {
        setStatus('error')
      }
    }
  }

  return (
    <div className={className}>
      <span
        title={noData ? t('calculator.writeConsumption') : undefined}
        className="inline-flex"
      >
        <button
          type="button"
          onClick={handleShare}
          onMouseEnter={warmSnapdom}
          onFocus={warmSnapdom}
          disabled={noData || status === 'working'}
          aria-busy={status === 'working'}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Share2 className="size-4" aria-hidden="true" />
          <span className="underline underline-offset-[3px]">
            {status === 'working' ? t('share.generating') : t('share.button')}
          </span>
        </button>
      </span>
      {status === 'error' ? (
        <p role="alert" className="mt-2 text-xs text-ember">
          {t('share.error')}
        </p>
      ) : null}
      {/* Capture source: rendered off-screen (never display:none, or SnapDOM
          would capture an empty box). Zero Tailwind color/font classes inside:
          ReceiptCard styles itself with inline hex literals (oklch-immune). */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-10000px', top: 0 }}
      >
        <div ref={nodeRef}>
          <ReceiptCard
            brandName="Lumio"
            projectionTitle={t('share.projection')}
            emittedLabel={t('share.emitted')}
            emittedAt={formatEmittedAt(emittedAt, lang)}
            kwhValue={activeKwh.toFixed(1)}
            kwhUnit="kWh"
            lines={lines}
            tariffLabel={tariffLabel}
            periodLabel={periodLabel}
            estimateNote={t('share.estimateNote')}
          />
        </div>
      </div>
    </div>
  )
}
