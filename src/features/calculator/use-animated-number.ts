import { useEffect, useRef, useState, type RefObject } from 'react'
import { animate } from 'animejs'
import {
  getCounterDuration,
  getCounterEasing,
  getCounterRef,
  isReducedMotion,
  LUMIO_COMMIT_EVENT,
  type CounterUnit,
} from '@/utils/animated-number.utils'

// Tweens the displayed number toward `target` with a delta-aware duration
// (big jumps run fast, small nudges stay smooth). The previous tween always
// cancels so fast typing never queues animations. First paint and
// prefers-reduced-motion render the final value instantly.
// `titleRef` is optional: when provided, a valid Enter commit (CountTotal)
// flashes the referenced element, skipped while the counter is tweening.
export function useAnimatedNumber(
  target: number,
  unit: CounterUnit,
  titleRef?: RefObject<HTMLHeadingElement | null>,
): number {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const tweeningRef = useRef(false)
  const pendingFlashRef = useRef(false)
  const firstRef = useRef(true)

  const flashTitle = () => {
    const el = titleRef?.current
    if (!el || isReducedMotion()) return
    animate(el, { scale: [1, 1.025, 1], duration: 200, ease: 'outCubic' })
  }

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      displayRef.current = target
      setDisplay(target)
      return
    }
    const from = displayRef.current
    if (from === target || !Number.isFinite(target)) {
      displayRef.current = target
      setDisplay(target)
      return
    }
    if (isReducedMotion()) {
      displayRef.current = target
      setDisplay(target)
      return
    }
    const ref = getCounterRef(unit)
    const delta = Math.abs(target - from)
    const proxy = { value: from }
    animRef.current?.cancel()
    tweeningRef.current = true
    const anim = animate(proxy, {
      value: target,
      duration: getCounterDuration(delta, ref),
      ease: getCounterEasing(delta, ref),
      onUpdate: () => {
        displayRef.current = proxy.value
        setDisplay(proxy.value)
      },
      onComplete: () => {
        tweeningRef.current = false
        if (pendingFlashRef.current) {
          pendingFlashRef.current = false
          flashTitle()
        }
      },
    })
    animRef.current = anim
    return () => {
      anim.cancel()
    }
  }, [target, unit])

  useEffect(() => {
    return () => {
      animRef.current?.cancel()
    }
  }, [])

  // Commit flash: a valid Enter in CountTotal (or a dirty settings commit)
  // dispatches LUMIO_COMMIT_EVENT. While the counter is tweening the pulse
  // queues and fires once at the end instead of competing; with no tween it
  // fires immediately. Skipped entirely under prefers-reduced-motion.
  useEffect(() => {
    const onCommit = () => {
      if (tweeningRef.current) {
        pendingFlashRef.current = true
        return
      }
      flashTitle()
    }
    window.addEventListener(LUMIO_COMMIT_EVENT, onCommit)
    return () => window.removeEventListener(LUMIO_COMMIT_EVENT, onCommit)
  }, [titleRef])

  return display
}
