import { useLumioStore } from '@/stores/lumio-store'
import type { AppLang } from '@/i18n'

// Lazy mount for the desktop history rail (Astro has no client:hover). Eager
// cost is this file plus the zustand store, already in the main bundle via the
// other islands; the rail component and the Base UI drawer stay in a split
// chunk until the first record exists. A visitor with an empty history never
// downloads it, and there is nothing to show them anyway -- which is why the
// criterion is a single condition rather than a hover sensor.
const DESKTOP_QUERY = '(min-width: 1024px)'

export function initHistoryRailLoader(rawLang: string) {
  const lang: AppLang = rawLang === 'en' ? 'en' : 'es'
  const rootEl = document.getElementById('history-rail-root')
  if (!rootEl || rootEl.hasAttribute('data-mounted')) return

  const mql = window.matchMedia(DESKTOP_QUERY)
  let unsubscribe: (() => void) | null = null
  // rehydrate() reaches check twice -- once through the store subscription and
  // once through onFinishHydration -- so without this it would createRoot on
  // the same element twice.
  let mounted = false

  const check = () => {
    if (mounted || !mql.matches) return
    if (useLumioStore.getState().records.length === 0) return
    mounted = true
    rootEl.setAttribute('data-mounted', '')
    // React owns the lifecycle from here: clearing to zero records renders
    // null without unmounting, and saving again re-renders with the enter
    // animation. Nothing left to watch.
    unsubscribe?.()
    unsubscribe = null
    mql.removeEventListener('change', check)
    void import('./history-rail').then(({ mountHistoryRailPanel }) =>
      mountHistoryRailPanel(rootEl, { lang })
    )
  }

  // Fires on every store write, including keystrokes, but early-returns until
  // the first record and detaches on mount. Not subscribeWithSelector: that
  // middleware is not installed.
  unsubscribe = useLumioStore.subscribe(check)
  // Load at 900px with history, resize to 1200px -> the rail still appears.
  mql.addEventListener('change', check)
  if (!useLumioStore.persist.hasHydrated()) {
    useLumioStore.persist.onFinishHydration(check)
  }
  // A reload with persisted history mounts right here: persist has no
  // skipHydration and localStorage is synchronous, so the state is already in.
  check()
}
