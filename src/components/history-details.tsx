import { MONEY, type Receipt } from '@/types'

type HistoryFieldProps = {
  label: string
  value: string | number
}

type Record = {
  kwh: number
  money: number
}

interface HistoryDetailsProps {
  records?: Record[]
}

export const HistoryDetails = ({ records }: HistoryDetailsProps) => {
  if (!records) {
    return (
      <div>
        <p className="text-xs">
          Aún no guardas ninguno. Escribe tu consumo y presiona Enter para tener
          promedio, máximo y mínimo aquí.
        </p>
      </div>
    )
  }

  const avgs = {
    money: records
      ? (
          records.reduce((acc, { money }) => acc + money, 0) / records.length
        ).toFixed(2)
      : 0,
    kwh: records
      ? (
          records.reduce((acc, { kwh }) => acc + kwh, 0) / records.length
        ).toFixed(2)
      : 0,
  }

  const moneyArr = records ? records?.map(({ money }) => money) : [0]

  const minPrice = Math.min(...moneyArr)
  const maxPrice = Math.max(...moneyArr)

  const historyMapper = {
    'Gasto Promedio': avgs['money'],
    'Consumo Promedio': `${avgs['kwh']} kwh`,
    'Gasto Minimo': minPrice,
    'Gasto Maximo': maxPrice,
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted-foreground">
      {Object.entries(historyMapper).map(([label, value], idx) => (
        <HistoryField key={idx} label={label} value={value} />
      ))}
    </div>
  )
}

const HistoryField = ({ label, value }: HistoryFieldProps) => (
  <>
    <p className="capitalize">{label}</p>
    <p className="text-right font-mono tabular-nums text-foreground">
      {typeof value === 'number' ? `${MONEY} ${value.toFixed(2)}` : `${value}`}
    </p>
  </>
)
