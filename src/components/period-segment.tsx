import { useState } from 'react'
import { cn } from '@/lib/utils'

type Periodo = 'mensual' | 'bimestral'

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: 'mensual', label: 'Mensual' },
  { key: 'bimestral', label: 'Bimestral' },
]

// Segmented control with decorative local state (mirrors the previous
// uncontrolled Tabs). Shared by the desktop footer and the mobile rows
// so both keep a single look.
export const PeriodSegment = () => {
  const [periodo, setPeriodo] = useState<Periodo>('mensual')

  return (
    <div className="flex">
      {PERIODOS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setPeriodo(key)}
          className={cn(
            'min-h-9 cursor-pointer rounded-md px-2.5 text-xs max-lg:min-h-11',
            periodo === key
              ? 'bg-primary font-medium text-primary-foreground'
              : 'font-normal text-muted-foreground'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
