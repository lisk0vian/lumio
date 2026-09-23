import { useEffect, useRef, useState } from 'react'

export type SnapdomApi = {
  preCapture: () => void
  (
    node: HTMLElement,
    options?: Record<string, unknown>
  ): Promise<{ toBlob: (options?: Record<string, unknown>) => Promise<Blob> }>
}

export type Preview = {
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
    const pending = import('@zumer/snapdom').then(
      (mod) => mod.snapdom as SnapdomApi
    )
    snapdomPromise = pending
    // Drop a rejected import from the cache, or every later attempt replays
    // the same failure and the "press to retry" in share.error is a lie.
    // Guarded by identity so a concurrent retry is never cleared.
    pending.catch(() => {
      if (snapdomPromise === pending) snapdomPromise = null
    })
  }
  const snapdom = await snapdomPromise
  if (!preCaptureArmed) {
    snapdom.preCapture()
    preCaptureArmed = true
  }
  return snapdom
}

// Cheap sync check, read before any await: phones/tablets always take the
// image route, desktops always take the text route.
export function isMobileDevice(): boolean {
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

export function useSnapdomCapture(activeKwh: number) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)

  // Revoke the object URL on unmount; closes/regenerations revoke eagerly.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  // ensureSnapdom self-heals its cache now, so this only has to swallow the
  // rejection: warming is best-effort and must never surface an error.
  const warmSnapdom = () => {
    ensureSnapdom().catch(() => {})
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
    const scale = isMobileDevice()
      ? CAPTURE_SCALE_MOBILE
      : CAPTURE_SCALE_DESKTOP
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

  const buildPreview = (blob: Blob, width: number, height: number): Preview => {
    return {
      url: URL.createObjectURL(blob),
      blob,
      fileName: `lumio-${Math.round(activeKwh)}kwh.png`,
      width,
      height,
    }
  }

  const replacePreview = (next: Preview) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = next.url
    setPreview(next)
  }

  return {
    nodeRef,
    preview,
    warmSnapdom,
    captureBlob,
    buildPreview,
    replacePreview,
  }
}
