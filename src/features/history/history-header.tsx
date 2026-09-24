import type { ReactNode } from 'react'
import { HistoryClearButton } from './history-clear-button'
import type { AppLang } from '@/i18n'

type HistoryHeaderProps = {
  lang: AppLang
  /** Title element: DrawerTitle in the drawer (dialog labelling), plain
   *  paragraph inline. The text and classes match; only the wrapper differs. */
  title: ReactNode
  /** Hide control: DrawerClose in the drawer, plain button inline. */
  close: ReactNode
}

// Shared header row for both history surfaces (drawer + inline tab):
// title and count on the left, clear + hide actions on the right.
export const HistoryHeader = ({ lang, title, close }: HistoryHeaderProps) => {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      {title}
      <div className="flex gap-3">
        <HistoryClearButton lang={lang} />
        {close}
      </div>
    </div>
  )
}
