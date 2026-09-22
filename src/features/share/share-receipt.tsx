import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  Check,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { useLumioStore } from '@/stores/lumio-store'
import { tariffCategories } from '@/data/tariffs.data'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  getValueById,
} from '@/utils/tariffs.utils'
import { useTranslations, type AppLang } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReceiptCard, type ReceiptLine } from './receipt-card'

type ShareStatus = 'idle' | 'working' | 'error'
type CopyState = 'idle' | 'copied' | 'text' | 'error'

type SnapdomApi = {
  preCapture: () => void
  (
    node: HTMLElement,
    options?: Record<string, unknown>
  ): Promise<{ toBlob: (options?: Record<string, unknown>) => Promise<Blob> }>
}

type Preview = {
  url: string
  blob: Blob
  fileName: string
  width: number
  height: number
}

// PNG-only capture, escala adaptativa: 2x en desktop (400px card -> 800px,
// nítido en Retina), 1.5x en móvil donde 2x tardaba lo suyo generando la
// imagen. Single format keeps copy/share fallbacks predictable, since
// ClipboardItem and file sharing support PNG everywhere.
const CAPTURE_SCALE_DESKTOP = 2
const CAPTURE_SCALE_MOBILE = 1.5

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

function canShareFile(file: File): boolean {
  return (
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  )
}

function formatKb(bytes: number): string {
  return bytes < 10240
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${Math.round(bytes / 1024)} KB`
}

type ShareOutcome = 'shared' | 'aborted' | 'unsupported'

// Cheap sync check, read before any await: phones/tablets always take the
// image route, desktops always take the text route.
function isMobileDevice(): boolean {
  const uaData = (
    navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  ).userAgentData
  if (typeof uaData?.mobile === 'boolean') return uaData.mobile
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return true
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

// Attempt the native sheet even when canShare is missing or negative:
// some browsers share files fine without reporting it. Anything that is
// not 'shared' or a user dismiss falls through to the text fallback.
async function tryNativeShare(file: File, text: string): Promise<ShareOutcome> {
  if (typeof navigator.share !== 'function') return 'unsupported'
  try {
    await navigator.share({ files: [file], title: 'Lumio', text })
    return 'shared'
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'aborted'
    }
    return 'unsupported'
  }
}

export const ShareReceiptButton = ({ lang, className }: { lang: AppLang; className?: string }) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [status, setStatus] = useState<ShareStatus>('idle')
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
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

  // Revoke the object URL on unmount; closes/regenerations revoke eagerly.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

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

  const summary = `Lumio · ${activeKwh.toFixed(1)} kWh → ${money(result.total)} (${t('receipt.total')}) · ${tariffLabel} · ${periodLabel}. ${t('share.estimateNote')}`

  // Readable WhatsApp text (desktop route): bold headers and total, italic
  // note, blank lines for breathing. No code fence, no dot leaders.
  const whatsappReceipt = [
    `*LUMIO · ${t('share.projection')}*`,
    `${t('share.emitted')}: ${formatEmittedAt(emittedAt, lang)}`,
    '',
    `*${activeKwh.toFixed(1)} kWh*`,
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

  const warmSnapdom = () => {
    ensureSnapdom().catch(() => {
      snapdomPromise = null
    })
  }

  const captureBlob = async (): Promise<{
    blob: Blob
    width: number
    height: number
  }> => {
    const node = nodeRef.current
    if (!node) throw new Error('missing receipt node')
    await document.fonts.ready
    // Cheap sync check before the async import: móvil captura a 1.5x para
    // no bloquear el hilo principal con el 2x completo.
    const scale = isMobileDevice() ? CAPTURE_SCALE_MOBILE : CAPTURE_SCALE_DESKTOP
    const snapdom = await ensureSnapdom()
    const capture = await snapdom(node, {
      scale,
      dpr: 1,
      backgroundColor: '#faf9f4',
      embedFonts: 'auto',
    })
    const blob = await capture.toBlob({ format: 'png' })
    return {
      blob,
      width: Math.round(node.offsetWidth * scale),
      height: Math.round(node.offsetHeight * scale),
    }
  }

  const buildPreview = (
    blob: Blob,
    width: number,
    height: number
  ): Preview => {
    return {
      url: URL.createObjectURL(blob),
      blob,
      fileName: `lumio-boleta-${Math.round(activeKwh)}kwh.png`,
      width,
      height,
    }
  }

  const replacePreview = (next: Preview) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = next.url
    setPreview(next)
  }

  const handleGenerate = async () => {
    if (noData || status === 'working') return
    const node = nodeRef.current
    if (!node) return
    const now = new Date()
    // Flush so the capture reads the fresh timestamp, not the last render.
    flushSync(() => {
      setEmittedAt(now)
      setStatus('working')
      setCopyState('idle')
    })
    try {
      const shot = await captureBlob()
      replacePreview(buildPreview(shot.blob, shot.width, shot.height))
      setStatus('idle')
      setOpen(true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('idle')
      } else {
        setStatus('error')
      }
    }
  }

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setCopyState('idle')
  }

  const handleDownload = () => {
    if (!preview) return
    const anchor = document.createElement('a')
    anchor.href = preview.url
    anchor.download = preview.fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  const handleCopyImage = async () => {
    if (!preview) return
    setCopyState('idle')
    try {
      if (typeof ClipboardItem === 'undefined') throw new Error('no image clipboard')
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': preview.blob }),
      ])
      setCopyState('copied')
    } catch {
      // Last resort: copy the text summary so the action never dead-ends.
      try {
        await navigator.clipboard.writeText(summary)
        setCopyState('text')
      } catch {
        setCopyState('error')
      }
    }
  }

  const handleNativeShare = async () => {
    if (!preview) return
    const file = new File([preview.blob], preview.fileName, {
      type: 'image/png',
    })
    if (!canShareFile(file)) return
    const outcome = await tryNativeShare(file, summary)
    if (outcome === 'unsupported') setStatus('error')
  }

  const handleWhatsApp = async () => {
    if (!preview) return
    // Mobile: always the image route. The share is attempted even when
    // canShare is negative, then falls back to download + text so the
    // receipt is never lost.
    if (isMobileDevice()) {
      const file = new File([preview.blob], preview.fileName, {
        type: 'image/png',
      })
      const outcome = await tryNativeShare(file, summary)
      if (outcome === 'unsupported') {
        handleDownload()
        window.open(
          `https://wa.me/?text=${encodeURIComponent(whatsappReceipt)}`,
          '_blank',
          'noopener'
        )
      }
      return
    }
    // Desktop: wa.me only takes text, so the full receipt goes as readable
    // formatted text with the same information as the image.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(whatsappReceipt)}`,
      '_blank',
      'noopener'
    )
  }

  const canNativeShare = preview
    ? canShareFile(
        new File([preview.blob], preview.fileName, { type: 'image/png' })
      )
    : false

  return (
    <div className={className}>
      <span
        title={noData ? t('calculator.writeConsumption') : undefined}
        className="inline-flex"
      >
        <button
          type="button"
          onClick={handleGenerate}
          onMouseEnter={warmSnapdom}
          onFocus={warmSnapdom}
          disabled={noData || status === 'working'}
          aria-busy={status === 'working'}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'working' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Share2 className="size-4" aria-hidden="true" />
          )}
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

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('share.previewTitle')}</DialogTitle>
            <DialogDescription>{t('share.previewDescription')}</DialogDescription>
          </DialogHeader>

          {preview ? (
            <div className="flex flex-col gap-3">
              <img
                src={preview.url}
                alt={t('share.previewTitle')}
                className="h-auto w-full rounded-md border border-border"
              />
              <p className="font-mono text-xs text-muted-foreground">
                PNG · {preview.width}×{preview.height} · {formatKb(preview.blob.size)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyImage}
                >
                  {copyState === 'copied' ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                  {copyState === 'copied' ? t('share.copied') : t('share.copyImage')}
                </Button>
                <Button type="button" onClick={handleNativeShare}>
                  <Share2 aria-hidden="true" />
                  {t('share.nativeShare')}
                </Button>
                <Button type="button" variant="secondary" onClick={handleWhatsApp}>
                  <MessageCircle aria-hidden="true" />
                  {t('share.whatsapp')}
                </Button>
                <Button type="button" variant="outline" onClick={handleDownload}>
                  <Download aria-hidden="true" />
                  {t('share.download')}
                </Button>
              </div>
              {copyState === 'text' ? (
                <p role="status" className="text-xs text-muted-foreground">
                  {t('share.copyTextFallback')}
                </p>
              ) : null}
              {copyState === 'error' ? (
                <p role="alert" className="text-xs text-ember">
                  {t('share.copyError')}
                </p>
              ) : null}
              {canNativeShare ? null : (
                <p className="text-xs text-muted-foreground">
                  {t('share.whatsappHint')}
                </p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

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
