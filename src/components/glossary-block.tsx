import { useState } from 'react'
import { cn } from '@/lib/utils'
import { t } from '@/i18n'

function getTerms() {
  return [
    {
      term: t('glossary.fixedCharge.term'),
      def: t('glossary.fixedCharge.def'),
    },
    {
      term: t('glossary.igv.term'),
      def: t('glossary.igv.def'),
    },
    {
      term: t('glossary.lighting.term'),
      def: t('glossary.lighting.def'),
    },
    {
      term: t('glossary.kwh.term'),
      def: t('glossary.kwh.def'),
    },
  ]
}

export const GlossaryBlock = () => {
  const TERMS = getTerms()
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
