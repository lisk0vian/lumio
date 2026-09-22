import { useEffect, useState } from 'react'
import { useLumioStore } from './lumio-store'

// Gate first paint on persist rehydration: avoids flashing default
// tariff/inputs/total before stored values land. Double-checked so the
// gate can never get stuck if rehydration already finished.
// Shared by every island so each one preserves Main's no-flash behavior.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useLumioStore.persist.hasHydrated()
  )

  useEffect(() => {
    if (useLumioStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useLumioStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
