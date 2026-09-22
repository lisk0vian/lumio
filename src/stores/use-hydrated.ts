import { useEffect, useState } from 'react'
import { useLumioStore } from './lumio-store'

// Gate first paint on persist rehydration: avoids flashing default
// tariff/inputs/total before stored values land.
// SSR-safe: initial render is always false (skeleton) on both server and
// client, so prerender never touches `persist` (undefined on the server)
// and hydration never mismatches. The effect flips it once rehydration
// finishes. Shared by every island so each one preserves no-flash behavior.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useLumioStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useLumioStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
