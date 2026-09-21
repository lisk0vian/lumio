import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useLumioStore } from '@/stores/lumio-store'
import { t } from '@/i18n'

export const ConversionToggle = () => {
  const direction = useLumioStore((state) => state.direction)
  const setDirection = useLumioStore((state) => state.setDirection)

  return (
    <Tabs
      value={direction === 'kwh-to-money' ? 'kwh-s' : 's-kwh'}
      onValueChange={(val) =>
        setDirection(val === 's-kwh' ? 'money-to-kwh' : 'kwh-to-money')
      }
    >
      <TabsList
        variant="line"
        className="mt-6.5 w-full justify-start gap-8 border-y border-border py-0 2xl:mt-10"
      >
        <TabsTrigger className="flex-1 rounded-none py-3 text-xs font-medium" value="kwh-s">
          {t('calculator.kwhToMoney')}{' '}
        </TabsTrigger>
        <TabsTrigger className="flex-1 rounded-none py-3 text-xs font-medium" value="s-kwh">
          {t('calculator.moneyToKwh')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
