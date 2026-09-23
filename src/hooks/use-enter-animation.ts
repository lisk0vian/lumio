import { useCallback, type RefCallback } from 'react'
import { animate } from 'animejs'
import { isReducedMotion } from '@/utils/animated-number.utils'

export type EnterAnimationOpts = {
  duration?: number
  fromX?: number
  fromY?: number
}

// Every element painted from the server HTML, captured the first time this
// module is evaluated. That happens when the first island chunk loads, which
// is before any of them calls hydrateRoot, so nothing React owns has been
// touched yet -- including client:visible islands that hydrate much later.
//
// Hydration reuses these exact nodes, and they are already on screen: fading
// them in from opacity 0 blinks visible content on every reload. Nodes React
// creates later (the history rail mounting into an empty div, a subtree that
// appears on state change) are absent from the set and still animate.
const prerendered = new WeakSet<Element>()
if (typeof document !== 'undefined') {
  for (const el of document.querySelectorAll('astro-island *')) {
    prerendered.add(el)
  }
}

// Single convention for mount-enter animations: every island fades in once
// with the same curve (default rise; rails slide from the side). GPU-only
// props (opacity, transform), instant under prefers-reduced-motion.
// display:contents roots have no box, so their children animate instead.
//
// Callback ref (not an effect): the animation fires when the node attaches
// to the DOM. An effect with [] would run once per component instance even
// if the first commit renders null (early return) and never re-run when the
// node actually mounts. Cancels on detach.
export function useEnterAnimation<T extends HTMLElement>(
  opts?: EnterAnimationOpts
): RefCallback<T> {
  const duration = opts?.duration ?? 200
  const fromX = opts?.fromX ?? 0
  const fromY = opts?.fromY ?? 6

  return useCallback(
    (node: T | null) => {
      if (!node || isReducedMotion()) return
      const roots: Element[] =
        getComputedStyle(node).display === 'contents'
          ? Array.from(node.children)
          : [node]
      const targets = roots.filter((el) => !prerendered.has(el))
      if (targets.length === 0) return
      for (const target of targets) {
        const el = target as HTMLElement
        el.style.opacity = '0'
      }
      const anim = animate(targets, {
        opacity: [0, 1],
        x: [fromX, 0],
        y: [fromY, 0],
        duration,
        ease: 'outCubic',
      })
      return () => {
        anim.cancel()
      }
    },
    [duration, fromX, fromY]
  )
}
