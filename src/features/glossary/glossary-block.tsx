import { Fragment } from 'react'
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

// Zero-JS glossary: tab switching is pure CSS via radio inputs, so Astro can
// render this to static HTML with no hydration — and the mobile shell reuses
// the exact same markup inside its island. `groupId` keeps the radio groups
// of the desktop and mobile instances independent.
export const GlossaryBlock = ({ lang, groupId = 'glossary' }: { lang: AppLang; groupId?: string }) => {
  const t = useTranslations(lang)
  const TERMS = getTerms(t)

  return (
    <SectionBlock title={t('sections.glossary')}>
      <div className="flex flex-wrap gap-1.5">
        {TERMS.map(({ term, def }, idx) => (
          <Fragment key={term}>
            <input
              type="radio"
              name={groupId}
              id={`${groupId}-${idx}`}
              defaultChecked={idx === 0}
              className="peer sr-only"
            />
            <label
              htmlFor={`${groupId}-${idx}`}
              className={cn(
                'order-1 cursor-pointer px-2.5 py-1.5 text-xs',
                'bg-muted font-normal text-muted-foreground',
                'peer-checked:bg-accent peer-checked:font-medium peer-checked:text-accent-foreground peer-checked:ring-1 peer-checked:ring-primary/40',
                'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember'
              )}
            >
              {term}
            </label>
            <div className="order-2 hidden w-full basis-full peer-checked:block">
              <p className="mt-2 min-h-19 text-xs leading-relaxed text-muted-foreground">
                {def}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </SectionBlock>
  )
}
