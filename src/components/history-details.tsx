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
    <div className="font-mono">
      {Object.entries(historyMapper).map(([label, value], idx) => (
        <HistoryField key={idx} label={label} value={value} />
      ))}
    </div>
  )
}

const HistoryField = ({ label, value }: HistoryFieldProps) => (
  <div className="flex justify-between text-sm">
    <p className="capitalize">{label}</p>
    <p className="text-foreground/90">
      {typeof value === 'number' ? `${MONEY} ${value.toFixed(2)}` : `${value}`}
    </p>
  </div>
)
