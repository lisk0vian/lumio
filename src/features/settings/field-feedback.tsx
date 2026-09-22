import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import {
  isReducedMotion,
  LUMIO_COMMIT_EVENT,
  LUMIO_SETTING_EVENT,
  type SettingFieldId,
} from '@/utils/animated-number.utils'
import type { RefObject } from 'react'

const IDLE_MS = 2000

// Shared typing + commit feedback for settings numeric fields (desktop
// InputSetting, mobile UnderlineInput). The ember underline lives while the
// mouse hovers or typing is recent (2s idle retires it); focus alone never
// lights it. Blur/Enter commits: settles the bar, pulses the wrapper and,
// only when the value actually changed, pings SummaryTotal like Enter does
// in CountTotal. Each caller owns its wrapper ref so JSX ref types stay
// exact. Passing `field` also reacts to its toggle button: enabling sweeps
// the bar in, disabling sweeps it out.
export function useFieldFeedback(field?: SettingFieldId) {
  const sweepRef = useRef<HTMLSpanElement | null>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const lastSweepRef = useRef(0)
  const hoveredRef = useRef(false)
  const dirtyRef = useRef(false)
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showBar = () => {
    const el = sweepRef.current
    if (!el) return
    lastSweepRef.current = Date.now()
    animRef.current?.cancel()
    animRef.current = animate(el, { scaleX: [0, 1], duration: 200, ease: 'outCubic' })
  }

  const hideBar = () => {
    const bar = sweepRef.current
    if (!bar) return
    animRef.current?.cancel()
    animRef.current = animate(bar, { scaleX: 0, duration: 150, ease: 'outCubic' })
  }

  const sweep = () => {
    if (isReducedMotion()) return
    dirtyRef.current = true
    armIdle()
    const now = Date.now()
    if (now - lastSweepRef.current < 250) return
    showBar()
  }

  const armIdle = () => {
    if (idleRef.current) clearTimeout(idleRef.current)
    if (isReducedMotion()) return
    idleRef.current = setTimeout(() => {
      if (!hoveredRef.current) hideBar()
    }, IDLE_MS)
  }

  const setHover = (hovered: boolean) => {
    hoveredRef.current = hovered
  }

  // Hover on: the line previews even before typing.
  const prime = () => {
    if (isReducedMotion()) return
    showBar()
  }

  // Hover off: the line retires (typing re-lights it while it lasts).
  const settle = () => {
    if (isReducedMotion()) return
    hideBar()
  }

  const commit = (wrap: HTMLElement | null) => {
    if (dirtyRef.current) {
      dirtyRef.current = false
      window.dispatchEvent(new Event(LUMIO_COMMIT_EVENT))
    }
    if (isReducedMotion()) return
    hideBar()
    if (wrap) animate(wrap, { opacity: [0.45, 1], duration: 250, ease: 'outCubic' })
  }

  // Paired toggle off: the field goes dormant, bar out.
  const dismiss = () => {
    if (isReducedMotion()) return
    hideBar()
  }

  useEffect(() => {
    if (!field) return
    const onToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ field: SettingFieldId; enabled: boolean }>).detail
      if (!detail || detail.field !== field) return
      if (detail.enabled) {
        prime()
        armIdle()
      } else dismiss()
    }
    window.addEventListener(LUMIO_SETTING_EVENT, onToggle)
    return () => window.removeEventListener(LUMIO_SETTING_EVENT, onToggle)
  }, [field])

  useEffect(() => {
    return () => {
      animRef.current?.cancel()
      if (idleRef.current) clearTimeout(idleRef.current)
    }
  }, [])

  return { sweepRef, sweep, setHover, prime, settle, commit }
}

export const FieldSweep = ({ sweepRef }: { sweepRef: RefObject<HTMLSpanElement | null> }) => (
  <span
    ref={sweepRef}
    aria-hidden="true"
    style={{ transform: 'scaleX(0)' }}
    className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ember"
  />
)
