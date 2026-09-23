import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Input } from '@/components/ui/input'
import { useLumioStore } from '@/stores/lumio-store'
import { useTranslations, type AppLang } from '@/i18n'
import { isReducedMotion, LUMIO_COMMIT_EVENT } from '@/utils/animated-number.utils'
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

  const rowRef = useRef<HTMLDivElement | null>(null)
  const unitRef = useRef<HTMLSpanElement | null>(null)
  const hintRef = useRef<HTMLParagraphElement | null>(null)
  const shakeAnimRef = useRef<ReturnType<typeof animate> | null>(null)
  const firstDirectionRef = useRef(true)
  const lastHintAnimRef = useRef(0)

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

  const shakeRow = () => {
    const el = rowRef.current
    if (!el || isReducedMotion()) return
    shakeAnimRef.current?.cancel()
    shakeAnimRef.current = animate(el, { x: [0, -7, 7, -5, 5, 0], duration: 300, ease: 'outQuad' })
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
    ? `≈ S/ ${calculateKwhToMoney(rawValue, inputs).total.toFixed(2)}`
    : `≈ ${calculateMoneyToKwh(rawValue, inputs).kwh.toFixed(1)} kWh`

  // Unit fades/slides when the conversion direction flips (rare event).
  useEffect(() => {
    if (firstDirectionRef.current) {
      firstDirectionRef.current = false
      return
    }
    const el = unitRef.current
    if (!el || isReducedMotion()) return
    animate(el, { opacity: [0, 1], y: [4, 0], duration: 120, ease: 'outCubic' })
  }, [isKwhMode])

  // Hint slides on value changes, throttled so fast typing never queues it.
  useEffect(() => {
    const el = hintRef.current
    if (!el || isReducedMotion()) return
    const now = Date.now()
    if (now - lastHintAnimRef.current < 250) return
    lastHintAnimRef.current = now
    animate(el, { opacity: [0.35, 1], y: [3, 0], duration: 150, ease: 'outCubic' })
  }, [hint])

  useEffect(() => {
    return () => {
      shakeAnimRef.current?.cancel()
    }
  }, [])

  return (
    <div ref={rowRef} className="flex flex-col">
      <div className="flex items-baseline gap-3 border-b border-border py-2 2xl:py-2">
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
            className="h-auto min-w-0 flex-1 border-transparent bg-background! py-1 text-right font-mono font-medium text-[clamp(2rem,8vw,3rem)] leading-none outline-none ring-0 tabular-nums focus-visible:border-foreground lg:text-[clamp(1.75rem,3vw,2rem)] 2xl:text-[2rem]"
          />
          <span ref={unitRef} className="inline-block font-mono text-base text-muted-foreground 2xl:text-lg">
            {isKwhMode ? 'kWh' : 'S/'}
          </span>
        </p>
      </div>
      <p ref={hintRef} className="pt-1 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {hint}
      </p>
      <div className="flex items-baseline justify-between gap-3 pt-1">
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
