type HistoryRecord = {
  kwh: number
  money: number
}

type HistorySidebarProps = {
  records: HistoryRecord[]
  hidden: boolean
  onHide: () => void
  onShow: () => void
}

export const HistorySidebar = ({ records, hidden, onHide, onShow }: HistorySidebarProps) => {
  if (records.length === 0) return null

  if (hidden) {
    return (
      <div className="flex w-full flex-none justify-center bg-muted/50 py-4 xl:w-27.5 xl:py-11">
        <button
          type="button"
          onClick={onShow}
          className="cursor-pointer text-xs tracking-[0.14em] text-muted-foreground uppercase xl:[writing-mode:vertical-rl]"
        >
          Historial · {records.length}
        </button>
      </div>
    )
  }

  return (
    <aside className="w-full flex-none bg-muted/50 px-8 py-8 max-lg:bg-transparent max-lg:px-0 max-lg:py-0 xl:w-80 xl:py-11">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Historial · {records.length}
        </p>
        <button
          type="button"
          onClick={onHide}
          className="cursor-pointer text-xs text-muted-foreground underline underline-offset-[3px]"
        >
          ocultar
        </button>
      </div>
      {records.map(({ kwh, money }, idx) => (
        <div key={idx} className="border-b border-border py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {kwh.toFixed(1)} kWh
            </span>
            <span className="font-mono text-base font-medium tabular-nums">
              S/ {money.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              title="Próximamente"
              className="cursor-pointer text-xs text-primary max-lg:min-h-11 max-lg:px-2"
            >
              editar
            </button>
            <button
              type="button"
              title="Próximamente"
              className="cursor-pointer font-mono text-xs text-muted-foreground max-lg:min-h-11 max-lg:px-2"
            >
              &#10005;
            </button>
          </div>
        </div>
      ))}
    </aside>
  )
}
