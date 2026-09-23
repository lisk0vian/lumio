import { cn } from '@/lib/utils'
import { languages, type AppLang } from '@/i18n/ui'

const LANGS = Object.keys(languages) as AppLang[]

// Stateless language navigation: plain anchors to the prerendered routes.
// No Zustand, no effects, no hydration needed — Astro renders this to static
// HTML on desktop, and the mobile shell reuses the same markup.
// `routes` is the same page in each language (defaults to home): switching
// language must keep the user on the page they are reading, not bounce them
// to `/`.
export const LanguagePicker = ({
  lang,
  routes = { es: '/', en: '/en/' },
}: {
  lang: AppLang
  routes?: Record<AppLang, string>
}) => {
  return (
    <div className="flex" role="group" aria-label="Language / Idioma">
      {LANGS.map((code) => (
        <a
          key={code}
          href={routes[code]}
          aria-current={code === lang ? 'true' : undefined}
          className={cn(
            'flex min-h-9 items-center justify-center rounded-md px-2.5 text-xs max-lg:min-h-11 max-lg:min-w-11',
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
