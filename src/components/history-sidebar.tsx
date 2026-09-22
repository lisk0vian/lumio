import { useLumioStore } from '@/stores/lumio-store'
import { t } from '@/i18n'
import { X } from 'lucide-react'

type HistorySidebarProps = {
  hidden: boolean
  onHide: () => void
  onShow: () => void
}

export const HistorySidebar = ({ hidden, onHide, onShow }: HistorySidebarProps) => {
  const records = useLumioStore((state) => state.records)
  const removeRecord = useLumioStore((state) => state.removeRecord)
  const clearRecords = useLumioStore((state) => state.clearRecords)
  if (records.length === 0) return null

  if (hidden) {
    return (
      <div className="flex w-full flex-none justify-center bg-muted py-4 xl:w-27.5 xl:py-11">
        <button
          type="button"
          onClick={onShow}
          className="cursor-pointer text-xs tracking-[0.14em] text-muted-foreground uppercase xl:[writing-mode:vertical-rl]"
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
          <button
            type="button"
            onClick={clearRecords}
            className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]"
          >
            {t('history.clear')}
          </button>
          <button
            type="button"
            onClick={onHide}
            className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]"
          >
            {t('history.hide')}
          </button>
        </div>
      </div>
      {records.map(({ id, resultKwh, resultMoney }) => (
        <div key={id} className="border-b border-border py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {resultKwh.toFixed(1)} kWh
            </span>
            <span className="font-mono text-base font-medium tabular-nums">
              S/ {resultMoney.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => removeRecord(id)}
              aria-label="Eliminar cálculo"
              className="cursor-pointer font-mono text-xs text-muted-foreground max-lg:min-h-11 max-lg:px-2"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </aside>
  )
}
