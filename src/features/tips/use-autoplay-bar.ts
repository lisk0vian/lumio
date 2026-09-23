import { useEffect, useRef, type RefObject } from 'react'
import { animate } from 'animejs'
import { isReducedMotion } from '@/utils/animated-number.utils'

// Autoplay where the progress bar IS the timer (scaleX 0→1, linear).
// Completion calls the latest onTick, and any index change retriggers the
// effect, so manual navigation always resets the countdown. Pauses while
// hovered, focused, or the tab is hidden. No autoplay at all under
// prefers-reduced-motion.
//
// onTick is stored in a ref (useLatest): the timer effect only depends on
// index, so store-driven re-renders never restart the countdown.
export function useAutoplayBar(args: {
  rootRef: RefObject<HTMLDivElement | null>
  barRef: RefObject<HTMLDivElement | null>
  index: number
  duration: number
  onTick: () => void
}): void {
  const { rootRef, barRef, index, duration, onTick } = args
  const barAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const hoverRef = useRef(false)
  const focusRef = useRef(false)
  const tickRef = useRef(onTick)
  tickRef.current = onTick

  useEffect(() => {
    const bar = barRef.current
    if (!bar || isReducedMotion()) return
    const anim = animate(bar, {
      scaleX: [0, 1],
      duration,
      ease: 'linear',
      onComplete: () => {
        tickRef.current()
      },
    })
    barAnimRef.current = anim
    return () => {
      anim.cancel()
    }
  }, [barRef, index, duration])

  // Pause while hovered, focused, or the tab is hidden; resume otherwise.
  useEffect(() => {
    const syncPause = () => {
      const anim = barAnimRef.current
      if (!anim) return
      if (
        hoverRef.current ||
        focusRef.current ||
        document.visibilityState === 'hidden'
      )
        anim.pause()
      else anim.play()
    }
    const root = rootRef.current
    const onEnter = () => {
      hoverRef.current = true
      syncPause()
    }
    const onLeave = () => {
      hoverRef.current = false
      syncPause()
    }
    const onFocusIn = () => {
      focusRef.current = true
      syncPause()
    }
    const onFocusOut = () => {
      focusRef.current = false
      syncPause()
    }
    root?.addEventListener('mouseenter', onEnter)
    root?.addEventListener('mouseleave', onLeave)
    root?.addEventListener('focusin', onFocusIn)
    root?.addEventListener('focusout', onFocusOut)
    document.addEventListener('visibilitychange', syncPause)
    return () => {
      root?.removeEventListener('mouseenter', onEnter)
      root?.removeEventListener('mouseleave', onLeave)
      root?.removeEventListener('focusin', onFocusIn)
      root?.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('visibilitychange', syncPause)
    }
  }, [rootRef])

  useEffect(() => {
    return () => {
      barAnimRef.current?.cancel()
    }
  }, [])
}
