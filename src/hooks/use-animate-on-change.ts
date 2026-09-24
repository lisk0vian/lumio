import { useEffect, useRef, type DependencyList } from 'react'
import { animate } from 'animejs'
import { isReducedMotion } from '@/utils/animated-number.utils'

type AnimationParams = Parameters<typeof animate>[1]

// Micro-animation that follows a value change: fades/slides/pops the target
// when deps change, skipping first paint and prefers-reduced-motion.
// Params ride a ref (useLatest), so the effect fires exactly on the caller's
// deps — an inline params object never retriggers it by identity.
export function useAnimateOnChange(
  getTarget: () => HTMLElement | null,
  params: AnimationParams,
  deps: DependencyList
): void {
  const firstRef = useRef(true)
  const targetRef = useRef(getTarget)
  targetRef.current = getTarget
  const paramsRef = useRef(params)
  paramsRef.current = params

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false
      return
    }
    const el = targetRef.current()
    if (!el || isReducedMotion()) return
    animate(el, paramsRef.current)
    // Deps are caller-owned (same values as the previous inline effect).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
