import es from './es.json'
import en from './en.json'

export const languages = {
  es: 'Español',
  en: 'English',
} as const

export type AppLang = keyof typeof languages

export const defaultLang: AppLang = 'es'

export const ui = { es, en } as const
