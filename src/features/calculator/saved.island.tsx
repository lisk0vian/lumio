import type { FC } from 'react'
import { HistoryDetails } from '../history/history-details'
import { ReferenceBlock } from './reference-block'
import { useHydrated } from '@/stores/use-hydrated'
import type { AppLang } from '@/i18n'

// Saved-calculations section content: history stats (records-driven) plus
// reference prices (settings-driven). Mounted inside an Astro section.
export const SavedIsland: FC<{ lang: AppLang }> = ({ lang }) => {
  const hydrated = useHydrated()

  if (!hydrated) return null

  return (
    // display:contents keeps a single island root without adding layout.
    <div className="contents">
      <HistoryDetails lang={lang} />
      <ReferenceBlock lang={lang} />
    </div>
  )
}
