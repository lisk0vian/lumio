import { useState } from 'react'
import { cn } from '@/lib/utils'

const TERMS = [
  {
    term: 'Cargo fijo',
    def: 'Lo que te cobran cada mes solo por estar conectado, aunque no consumas nada.',
  },
  {
    term: 'IGV 18 %',
    def: 'Impuesto que se suma al final, sobre la energía más el cargo fijo. Puedes apagarlo aquí si quieres ver el monto neto.',
  },
  {
    term: 'Alumbrado público',
    def: 'Aporte por las luces de la calle. Va aparte de tu consumo y suele ser una parte pequeña del recibo.',
  },
  {
    term: 'kWh',
    def: 'Un kilovatio-hora: tener algo de 1000 W encendido durante una hora.',
  },
]

export const GlossaryBlock = () => {
  const [selected, setSelected] = useState(0)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {TERMS.map(({ term }, idx) => (
          <button
            key={term}
            type="button"
            onClick={() => setSelected(idx)}
            className={cn(
              'cursor-pointer px-2.5 py-1.5 text-xs',
              selected === idx
                ? 'bg-foreground font-medium text-background'
                : 'bg-muted font-normal text-muted-foreground'
            )}
          >
            {term}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-19 text-xs leading-relaxed text-muted-foreground">
        {TERMS[selected].def}
      </p>
    </div>
  )
}
