import type { FC } from 'react'
import { HistoryDetails } from '../history/history-details'
import { ReferenceBlock } from './reference-block'
import { Skeleton } from '@/components/ui/skeleton'
import { useHydrated } from '@/stores/use-hydrated'
import type { AppLang } from '@/i18n'

// Saved-calculations section content: history stats (records-driven) plus
// reference prices (settings-driven). Mounted inside an Astro section.
export const SavedIsland: FC<{ lang: AppLang }> = ({ lang }) => {
  const hydrated = useHydrated()

  if (!hydrated)
    return (
      <div className="contents" aria-hidden="true">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-6 w-1/2" />
        </div>
      </div>
    )

  return (
    // display:contents keeps a single island root without adding layout.
    <div className="contents">
      <HistoryDetails lang={lang} />
      <ReferenceBlock lang={lang} />
    </div>
  )
}
