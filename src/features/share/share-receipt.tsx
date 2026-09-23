import { useMemo, useState } from 'react'
import { flushSync } from 'react-dom'
import { Loader2, Share2 } from 'lucide-react'
import { useTranslations, type AppLang } from '@/i18n'
import { ReceiptCard } from './receipt-card'
import { ShareDialog } from './share-dialog'
import { useShareFeedback, type ShareStatus } from './use-share-feedback'
import { isMobileDevice, useSnapdomCapture } from './use-snapdom-capture'
import { formatEmittedAt, useReceiptShareData } from './use-receipt-share-data'

function canShareFile(file: File): boolean {
  return (
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  )
}

type ShareOutcome = 'shared' | 'aborted' | 'unsupported'

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

export const ShareReceiptButton = ({
  lang,
  className,
}: {
  lang: AppLang
  className?: string
}) => {
  const [status, setStatus] = useState<ShareStatus>('idle')
  const [open, setOpen] = useState(false)
  // Null until a capture runs: seeding it with new Date() made the server
  // and client render different text and tripped React's hydration mismatch.
  const [emittedAt, setEmittedAt] = useState<Date | null>(null)
  const t = useTranslations(lang)
  const { feedback, flash } = useShareFeedback()
  const {
    activeKwh,
    noData,
    tariffLabel,
    periodLabel,
    lines,
    summary,
    whatsappReceipt,
  } = useReceiptShareData(lang, emittedAt)
  const {
    nodeRef,
    preview,
    warmSnapdom,
    captureBlob,
    buildPreview,
    replacePreview,
  } = useSnapdomCapture(activeKwh)

  const handleGenerate = async () => {
    if (noData || status === 'working') return
    const node = nodeRef.current
    if (!node) return
    const now = new Date()
    // Flush so the capture reads the fresh timestamp, not the last render.
    flushSync(() => {
      setEmittedAt(now)
      setStatus('working')
      flash('idle')
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
    if (!nextOpen) {
      flash('idle')
      // A failed native share left the page-level alert stranded behind the
      // overlay; clearing on close keeps it from reappearing out of context.
      if (status === 'error') setStatus('idle')
    }
  }

  const handleDownload = () => {
    if (!preview) return
    const anchor = document.createElement('a')
    anchor.href = preview.url
    anchor.download = preview.fileName
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    flash('downloaded')
  }

  const handleCopyImage = async () => {
    if (!preview) return
    try {
      if (typeof ClipboardItem === 'undefined')
        throw new Error('no image clipboard')
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': preview.blob }),
      ])
      flash('copied')
    } catch {
      // Last resort: copy the text summary so the action never dead-ends.
      try {
        await navigator.clipboard.writeText(summary)
        flash('text')
      } catch {
        flash('error')
      }
    }
  }

  // Guarded by the same flag that disables the button, so this can no longer
  // be a click that silently does nothing.
  const handleNativeShare = async () => {
    if (!preview || !canNativeShare) return
    const file = new File([preview.blob], preview.fileName, {
      type: 'image/png',
    })
    const outcome = await tryNativeShare(file, summary)
    if (outcome === 'unsupported') setStatus('error')
  }

  const handleWhatsApp = async () => {
    if (!preview) return
    // window.open after an await loses the user gesture and gets blocked by
    // popup blockers, so the await only happens on the path that does not need
    // to open a window: the native sheet, when it is actually available.
    if (isMobileDevice() && canNativeShare) {
      const file = new File([preview.blob], preview.fileName, {
        type: 'image/png',
      })
      const outcome = await tryNativeShare(file, summary)
      if (outcome !== 'unsupported') return
      // Sheet refused the file: keep the receipt rather than chase a popup
      // that this gesture can no longer open.
      handleDownload()
      return
    }
    // wa.me only takes text, so the full receipt goes as readable formatted
    // text carrying the same information as the image.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(whatsappReceipt)}`,
      '_blank',
      'noopener'
    )
  }

  // Probed once per preview instead of on every render, where it built a
  // throwaway File each time.
  const canNativeShare = useMemo(
    () =>
      preview
        ? canShareFile(
            new File([preview.blob], preview.fileName, { type: 'image/png' })
          )
        : false,
    [preview]
  )

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
          className="group inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs text-ember transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'working' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Share2
              className="size-4 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
          )}
          <span className="link-ember">
            {status === 'working' ? t('share.generating') : t('share.button')}
          </span>
        </button>
      </span>
      {status === 'error' && !open ? (
        <p role="alert" className="mt-2 text-xs text-ember">
          {t('share.error')}
        </p>
      ) : null}

      <ShareDialog
        lang={lang}
        open={open}
        onOpenChange={handleDialogChange}
        preview={preview}
        status={status}
        feedback={feedback}
        canNativeShare={canNativeShare}
        onNativeShare={handleNativeShare}
        onWhatsApp={handleWhatsApp}
        onCopyImage={handleCopyImage}
        onDownload={handleDownload}
      />

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
            emittedAt={emittedAt ? formatEmittedAt(emittedAt, lang) : ''}
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
