import type { FC } from 'react'
import { HistoryDetails } from '../history/history-details'
import { ReferenceBlock } from './reference-block'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import type { AppLang } from '@/i18n'

// Saved-calculations section content: history stats (records-driven) plus
// reference prices (settings-driven). Mounted inside an Astro section.
export const SavedIsland: FC<{ lang: AppLang }> = ({ lang }) => {
  const enterRef = useEnterAnimation<HTMLDivElement>()

  return (
    // display:contents keeps a single island root without adding layout.
    <div ref={enterRef} className="contents">
      <HistoryDetails lang={lang} />
      <ReferenceBlock lang={lang} />
    </div>
  )
}
