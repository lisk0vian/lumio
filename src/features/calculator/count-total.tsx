import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { Input } from '@/components/ui/input'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'
import {
  isReducedMotion,
  LUMIO_COMMIT_EVENT,
} from '@/utils/animated-number.utils'
import { useAnimateOnChange } from '@/hooks/use-animate-on-change'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
  sanitizeNonNegative,
} from '@/utils/calculation.utils'
import { parseEntryText, sanitizeEntryText } from '@/utils/entry-text.utils'
import { formatKwh, formatMoney } from '@/utils/format.utils'
import { useCalculationInputs } from './use-calculation-inputs'
import { useEntryDraft } from './use-entry-draft'

export const CountTotal = ({
  lang,
  showResumen = false,
}: {
  lang: AppLang
  showResumen?: boolean
}) => {
  const direction = useLumioStore((state) => state.direction)
  const inputKwh = useLumioStore((state) => state.inputKwh)
  const inputMoney = useLumioStore((state) => state.inputMoney)
  const setInputKwh = useLumioStore((state) => state.setInputKwh)
  const setInputMoney = useLumioStore((state) => state.setInputMoney)
  const addRecord = useLumioStore((state) => state.addRecord)
  const inputs = useCalculationInputs()
  const t = useTranslations(lang)

  const rowRef = useRef<HTMLDivElement | null>(null)
  const unitRef = useRef<HTMLSpanElement | null>(null)
  const hintRef = useRef<HTMLParagraphElement | null>(null)
  const shakeAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const lastHintAnimRef = useRef(0)

  const isKwhMode = direction === 'kwh-to-money'
  const rawValue = isKwhMode ? inputKwh : inputMoney

  // El campo guarda el *texto* escrito, no el número (ver use-entry-draft).
  const { draft, setDraft, setPushed } = useEntryDraft(rawValue)

  const shakeRow = () => {
    const el = rowRef.current
    if (!el || isReducedMotion()) return
    shakeAnimRef.current?.cancel()
    shakeAnimRef.current = animate(el, {
      x: [0, -7, 7, -5, 5, 0],
      duration: 300,
      ease: 'outQuad',
    })
  }

  const handleCommit = () => {
    const clean = sanitizeNonNegative(rawValue)
    if (clean <= 0) {
      shakeRow()
      return
    }
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
    window.dispatchEvent(new Event(LUMIO_COMMIT_EVENT))
  }

  // Derived counterpart shown as a hint under the input.
  const hint = isKwhMode
    ? `≈ ${formatMoney(calculateKwhToMoney(rawValue, inputs).total)}`
    : `≈ ${formatKwh(calculateMoneyToKwh(rawValue, inputs).kwh)}`

  // Unit fades/slides when the conversion direction flips (rare event).
  useAnimateOnChange(
    () => unitRef.current,
    { opacity: [0, 1], y: [4, 0], duration: 120, ease: 'outCubic' },
    [isKwhMode]
  )

  // Hint slides on value changes, throttled so fast typing never queues it.
  useEffect(() => {
    const el = hintRef.current
    if (!el || isReducedMotion()) return
    const now = Date.now()
    if (now - lastHintAnimRef.current < 250) return
    lastHintAnimRef.current = now
    animate(el, {
      opacity: [0.35, 1],
      y: [3, 0],
      duration: 150,
      ease: 'outCubic',
    })
  }, [hint])

  useEffect(() => {
    return () => {
      shakeAnimRef.current?.cancel()
    }
  }, [])

  return (
    <div ref={rowRef} className="flex flex-col">
      <div className="flex items-baseline gap-3 border-b border-border py-2 transition-colors focus-within:border-foreground 2xl:py-2">
        <p className="text-xs whitespace-nowrap text-muted-foreground">
          {isKwhMode ? t('calculator.consumption') : t('calculator.amount')}
        </p>
        <p className="flex min-w-0 flex-1 items-baseline justify-end gap-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            aria-label={
              isKwhMode ? t('calculator.consumption') : t('calculator.amount')
            }
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
            className="h-auto min-w-0 flex-1 border-transparent bg-background! py-1 text-right font-mono font-medium text-[clamp(2rem,8vw,3rem)] leading-none outline-none ring-0 tabular-nums focus-visible:border-transparent focus-visible:ring-0 lg:text-[clamp(1.75rem,3vw,2rem)] 2xl:text-[2rem]"
          />
          <span
            ref={unitRef}
            className="inline-block font-mono text-base text-muted-foreground 2xl:text-lg"
          >
            {isKwhMode ? 'kWh' : 'S/'}
          </span>
        </p>
      </div>
      <p
        ref={hintRef}
        className="pt-1 text-right font-mono text-xs tabular-nums text-muted-foreground"
      >
        {hint}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
        <div className="flex items-center gap-2.5">
          {/* Enter still commits, but it cannot be the only way in: with
              inputMode="decimal" iOS renders a numeric pad that has no return
              key, so this button is the sole save path on much of mobile. */}
          <button
            type="button"
            onClick={handleCommit}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-ember px-3 text-xs font-medium text-ember transition-colors hover:bg-ember hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember lg:min-h-8"
          >
            {t('calculator.save')}
          </button>
          <p className="text-xs whitespace-nowrap text-muted-foreground max-lg:hidden">
            {t('calculator.enterSaves')}
          </p>
        </div>
        {showResumen ? (
          <p className="text-right font-mono text-[0.625rem] text-muted-foreground">
            S/ {inputs.pricePerKwh}/kWh · {t('settings.fixedCharge')} S/{' '}
            {inputs.fixedCharge} ·{' '}
            {inputs.isTaxEnabled
              ? `IGV ${Math.round(inputs.igvRate * 100)}%`
              : t('calculator.withoutIgv')}
          </p>
        ) : null}
      </div>
    </div>
  )
}
