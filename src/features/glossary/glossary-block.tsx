import { cn } from '@/lib/utils'
import { useTranslations, type AppLang } from '@/i18n'
import type { I18nKey } from '@/i18n/utils'
import { SectionBlock } from '../shell/section'

function getTerms(t: (key: I18nKey) => string) {
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

// Zero-JS glossary: tab switching is pure CSS, so Astro can render this to
// static HTML with no hydration — and the mobile shell reuses the exact same
// markup inside its island. Correlation uses :has() on a display:contents
// wrapper (see global.css): Tailwind's peer variant compiles to
// `.peer:checked ~ *`, which leaks across all preceding radios when several
// share one container and selects/shows multiple tabs at once.
// `groupId` keeps the radio groups of desktop and mobile apart.
export const GlossaryBlock = ({ lang, groupId = 'glossary' }: { lang: AppLang; groupId?: string }) => {
  const t = useTranslations(lang)
  const TERMS = getTerms(t)

  return (
    <SectionBlock title={t('sections.glossary')}>
      <div className="flex flex-wrap gap-1.5">
        {TERMS.map(({ term, def }, idx) => (
          <div key={term} data-glossary-tab className="contents">
            <input
              type="radio"
              name={groupId}
              id={`${groupId}-${idx}`}
              defaultChecked={idx === 0}
              className="sr-only"
            />
            <label
              htmlFor={`${groupId}-${idx}`}
              className={cn(
                'order-1 cursor-pointer px-2.5 py-1.5 text-xs',
                'bg-muted font-normal text-muted-foreground'
              )}
            >
              {term}
            </label>
            <div
              data-glossary-panel
              className="order-2 w-full basis-full"
            >
              <p className="mt-2 line-clamp-4 min-h-16 text-xs leading-relaxed text-muted-foreground">
                {def}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  )
}
