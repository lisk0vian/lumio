import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  formatEntryText,
  parseEntryText,
  sanitizeEntryText,
  sanitizeNonNegative,
} from '@/utils/tariffs.utils'

export const CountTotal = ({ lang, showResumen = false }: { lang: AppLang; showResumen?: boolean }) => {
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)
  const setInputKwh = useLumioStore((state) => state.setInputKwh)
  const setInputMoney = useLumioStore((state) => state.setInputMoney)
  const addRecord = useLumioStore((state) => state.addRecord)
  const pricePerKwh = useLumioStore((state) => state.pricePerKwh)
  const fixedCharge = useLumioStore((state) => state.fixedCharge)
  const publicLightingCharge = useLumioStore(
    (state) => state.publicLightingCharge
  )
  const igvRate = useLumioStore((state) => state.igvRate)
  const isFixedChargeEnabled = useLumioStore(
    (state) => state.isFixedChargeEnabled
  )
  const isPublicLightingEnabled = useLumioStore(
    (state) => state.isPublicLightingEnabled
  )
  const isTaxEnabled = useLumioStore((state) => state.isTaxEnabled)
  const period = useLumioStore((state) => state.period)
  const t = useTranslations(lang)

  const isKwhMode = direction === 'kwh-to-money'
  const rawValue = isKwhMode ? inputKwh : inputMoney

  // El campo guarda el *texto* escrito, no el número: con un input numérico
  // controlado, teclear "22." se reescribía como 22 y el 5 siguiente acababa
  // formando "225". El borrador solo se reajusta cuando el valor cambia desde
  // afuera (cambio de unidad, reset, hidratación), y compara contra el último
  // valor que empujamos nosotros: nuestro propio 22 (el de "22.") no debe
  // contar como cambio externo, o el punto se borraría igual.
  const [draft, setDraft] = useState(() => formatEntryText(rawValue))
  const [pushed, setPushed] = useState(rawValue)
  if (rawValue !== pushed) {
    setPushed(rawValue)
    setDraft(formatEntryText(rawValue))
  }

  const inputs = {
    pricePerKwh,
    fixedCharge,
    publicLightingCharge,
    igvRate,
    isFixedChargeEnabled,
    isPublicLightingEnabled,
    isTaxEnabled,
    period,
  }

  const handleCommit = () => {
    const clean = sanitizeNonNegative(rawValue)
    if (clean <= 0) return
    if (isKwhMode) {
      const { total } = calculateKwhToMoney(clean, inputs)
      addRecord({
        direction,
        inputKwh: clean,
        inputMoney: null,
        resultKwh: clean,
        resultMoney: total,
      })
    } else {
      const { kwh } = calculateMoneyToKwh(clean, inputs)
      addRecord({
        direction,
        inputKwh: null,
        inputMoney: clean,
        resultKwh: kwh,
        resultMoney: clean,
      })
    }
  }

  // Derived counterpart shown as a hint under the input.
  const hint = isKwhMode
    ? `≈ S/ ${calculateKwhToMoney(rawValue, inputs).total.toFixed(2)}`
    : `≈ ${calculateMoneyToKwh(rawValue, inputs).kwh.toFixed(1)} kWh`

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-3 border-b border-border py-5 2xl:py-6">
        <p className="text-xs whitespace-nowrap text-muted-foreground">
          {isKwhMode ? t('calculator.consumption') : t('calculator.amount')}
        </p>
        <p className="flex min-w-0 flex-1 items-baseline justify-end gap-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={draft}
            onChange={(e) => {
              const text = sanitizeEntryText(e.target.value)
              const parsed = parseEntryText(text)
              setPushed(parsed)
              setDraft(text)
              if (isKwhMode) setInputKwh(parsed)
              else setInputMoney(parsed)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommit()
            }}
            className="h-auto min-w-0 flex-1 border-transparent bg-background! py-1 text-right font-mono font-medium text-[clamp(2rem,8vw,3rem)] leading-none outline-none ring-0 tabular-nums focus-visible:border-foreground 2xl:text-6xl"
          />
          <span className="font-mono text-base text-muted-foreground 2xl:text-lg">
            {isKwhMode ? 'kWh' : 'S/'}
          </span>
        </p>
      </div>
      <p className="pt-1 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {hint}
      </p>
      <div className="flex items-baseline justify-between gap-3 pt-2">
        <p className="text-xs whitespace-nowrap text-muted-foreground">{t('calculator.enterSaves')}</p>
        {showResumen ? (
          <p className="text-right font-mono text-[0.625rem] text-muted-foreground">
            S/ {pricePerKwh}/kWh · {t('settings.fixedCharge')} S/ {fixedCharge} · {isTaxEnabled ? `IGV ${Math.round(igvRate * 100)}%` : t('calculator.withoutIgv')}
          </p>
        ) : null}
      </div>
    </div>
  )
}
