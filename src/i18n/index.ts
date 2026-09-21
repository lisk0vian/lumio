import es from './es.json'

export type I18nKey = keyof typeof es

export function t(key: I18nKey): string {
  return es[key]
}
