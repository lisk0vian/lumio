import { useEffect } from 'react'
import { useLumioStore } from '@/stores/lumio-store'

// The store persists with skipHydration, so the first render -- server and
// client alike -- always sees initialData. That is what makes the prerendered
// HTML and React's first client render agree: otherwise zustand reads
// localStorage at module scope, React renders values the static HTML never
// had, and it discards the whole island subtree and repaints it.
//
// Rehydration is kicked off here instead, from an effect, so it lands as an
// ordinary state update after the first commit. The totals then tween into
// place through useAnimatedNumber rather than snapping, and the layout never
// changes shape, because the tree is the real one from the very first frame.
//
// Module guard: one island per cohort calls this (CalculatorBlock on desktop,
// MobileTabs on mobile) and only the first call does the work.
let started = false

export function useStoreRehydration(): void {
  useEffect(() => {
    if (started) return
    started = true
    void useLumioStore.persist.rehydrate()
  }, [])
}
