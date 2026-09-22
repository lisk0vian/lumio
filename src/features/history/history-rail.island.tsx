import { useState, type FC } from 'react'
import { HistorySidebar } from './history-sidebar'
import { useHydrated } from '@/stores/use-hydrated'
import type { AppLang } from '@/i18n'

// Desktop history rail: owns its own open/closed state instead of lifting
// it to a giant root. Closed by default and never persisted: refresh always
// returns to closed.
export const HistoryRail: FC<{ lang: AppLang }> = ({ lang }) => {
  // Closed by default and never persisted: refresh always returns to closed.
  const [sidebarHidden, setSidebarHidden] = useState(true)
  const hydrated = useHydrated()

  if (!hydrated) return null

  return (
    <HistorySidebar
      lang={lang}
      hidden={sidebarHidden}
      onHide={() => setSidebarHidden(true)}
      onShow={() => setSidebarHidden(false)}
    />
  )
}
