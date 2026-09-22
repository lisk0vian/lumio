import { cn } from '@/lib/utils'
import { languages, type AppLang } from '@/i18n/ui'

const LANGS = Object.keys(languages) as AppLang[]

const HREFS: Record<AppLang, string> = {
  es: '/',
  en: '/en/',
}

// Stateless language navigation: plain anchors to the prerendered routes.
// No Zustand, no effects, no hydration needed — Astro renders this to static
// HTML on desktop, and the mobile shell reuses the same markup.
export const LanguagePicker = ({ lang }: { lang: AppLang }) => {
  return (
    <div className="flex" role="group" aria-label="Language / Idioma">
      {LANGS.map((code) => (
        <a
          key={code}
          href={HREFS[code]}
          aria-current={code === lang ? 'true' : undefined}
          className={cn(
            'flex min-h-9 items-center rounded-md px-2.5 text-xs max-lg:min-h-11',
            code === lang
              ? 'bg-primary font-medium text-primary-foreground'
              : 'font-normal text-muted-foreground'
          )}
        >
          {code.toUpperCase()}
        </a>
      ))}
    </div>
  )
}
