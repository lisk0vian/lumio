import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'
import { HistoryClearButton } from './history-clear-button'
import { HistoryRecordList } from './history-record-list'

type HistorySidebarProps = {
  lang: AppLang
  hidden: boolean
  onHide: () => void
  onShow: () => void
}

// Inline (non-drawer) history, used only by the mobile tab. The rows and the
// clear button are the shared components, so this surface and the desktop
// drawer stay in sync by construction.
export const HistorySidebar = ({ lang, hidden, onHide, onShow }: HistorySidebarProps) => {
  const records = useLumioStore((state) => state.records)
  const t = useTranslations(lang)
  if (records.length === 0) return null

  if (hidden) {
    return (
      <div className="flex w-full flex-none justify-center bg-muted py-4 xl:w-27.5 xl:py-11">
        <button
          type="button"
          onClick={onShow}
          className="cursor-pointer text-xs tracking-[0.14em] text-muted-foreground uppercase max-lg:min-h-11 max-lg:px-4 xl:[writing-mode:vertical-rl]"
        >
          {t('history.title')} · {records.length}
        </button>
      </div>
    )
  }

  return (
    <aside className="w-full flex-none bg-muted px-8 py-8 max-lg:bg-transparent max-lg:px-0 max-lg:py-0 xl:w-80 xl:py-11">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {t('history.title')} · {records.length}
        </p>
        <div className="flex gap-3">
          <HistoryClearButton lang={lang} />
          <button
            type="button"
            onClick={onHide}
            className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px] max-lg:min-h-11 max-lg:px-2"
          >
            {t('history.hide')}
          </button>
        </div>
      </div>
      <HistoryRecordList lang={lang} />
    </aside>
  )
}
