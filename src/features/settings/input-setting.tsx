import { useRef } from 'react'
import { Input } from '@base-ui/react'
import { FieldSweep, useFieldFeedback } from './field-feedback'
import type { SettingFieldId } from '@/utils/animated-number.utils'
import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'

type InputSettingProps = React.ComponentProps<typeof Input> & {
  label: string
  unit?: string
  field?: SettingFieldId
}

export const InputSetting = ({
  label,
  unit,
  className,
  field,
  onValueChange,
  onBlur,
  onKeyDown,
  ...props
}: InputSettingProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const { sweepRef, sweep, setHover, prime, settle, commit } =
    useFieldFeedback(field)
  const fixedOn = useLumioStore((state) => state.isFixedChargeEnabled)
  const lightingOn = useLumioStore((state) => state.isPublicLightingEnabled)
  const taxOn = useLumioStore((state) => state.isTaxEnabled)
  const enabled =
    field === 'fixed'
      ? fixedOn
      : field === 'lighting'
        ? lightingOn
        : field === 'tax'
          ? taxOn
          : true

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => {
        setHover(true)
        if (enabled) prime()
      }}
      onMouseLeave={() => {
        setHover(false)
        settle()
      }}
      className="flex flex-none items-center gap-2 text-xs max-lg:mr-0 max-lg:w-full"
    >
      <p className="whitespace-nowrap">{label}</p>
      <span className="relative ml-auto flex items-center gap-2">
        <Input
          aria-label={[label, unit].filter(Boolean).join(' ')}
          className={cn(
            'h-7 max-w-16 border-b-2 border-border text-right font-mono tabular-nums focus:border-ember disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
          disabled={props.disabled ?? !enabled}
          onValueChange={(...args) => {
            sweep()
            onValueChange?.(...args)
          }}
          onBlur={(event) => {
            commit(wrapRef.current)
            onBlur?.(event)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit(wrapRef.current)
            onKeyDown?.(event)
          }}
        />
        <FieldSweep sweepRef={sweepRef} />
        {unit && <p className="whitespace-nowrap">{unit}</p>}
      </span>
    </div>
  )
}
