import { MONEY } from '@/types'
import { useLumioStore } from '@/stores/lumio-store'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import { useTranslations, type AppLang } from '@/i18n'

type HistoryFieldProps = {
  label: string
  value: string | number
}

export const HistoryDetails = ({ lang }: { lang: AppLang }) => {
  const records = useLumioStore((state) => state.records)
  const t = useTranslations(lang)
  // Callback ref: fires when this container attaches, so the stats block
  // enters smoothly the moment the first record lands (not on an earlier
  // empty commit). Shared by desktop saved section and mobile hist tab.
  const enterRef = useEnterAnimation<HTMLDivElement>()

  if (records.length === 0) {
    return (
      <div>
        <p className="text-xs">
          {t('history.empty')}
        </p>
      </div>
    )
  }

  const avgs = {
    money: (records.reduce((acc, { resultMoney }) => acc + resultMoney, 0) / records.length).toFixed(2),
    kwh: (records.reduce((acc, { resultKwh }) => acc + resultKwh, 0) / records.length).toFixed(2),
  }

  const moneyArr = records.map(({ resultMoney }) => resultMoney)

  const minPrice = Math.min(...moneyArr)
  const maxPrice = Math.max(...moneyArr)

  const historyMapper = {
    [t('history.avgExpense')]: avgs['money'],
    [t('history.avgConsumption')]: `${avgs['kwh']} kwh`,
    [t('history.minExpense')]: minPrice,
    [t('history.maxExpense')]: maxPrice,
  }

  return (
    <div ref={enterRef} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted-foreground">
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
