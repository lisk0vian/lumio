import { cn } from '@/lib/utils'
import { useLumioStore } from '@/stores/lumio-store'
import { languages, type AppLang } from '@/i18n/ui'

const LANGS = Object.keys(languages) as AppLang[]

export const LanguagePicker = () => {
  const activeLang = useLumioStore((state) => state.activeLang)
  const setActiveLang = useLumioStore((state) => state.setActiveLang)

  return (
    <div className="flex" role="group" aria-label="Language / Idioma">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setActiveLang(lang)}
          className={cn(
            'min-h-9 cursor-pointer rounded-md px-2.5 text-xs max-lg:min-h-11',
            activeLang === lang
              ? 'bg-primary font-medium text-primary-foreground'
              : 'font-normal text-muted-foreground'
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
