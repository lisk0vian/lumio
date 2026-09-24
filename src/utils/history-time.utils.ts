// Pure date helpers for history records. No React/UI code here on purpose --
// unit tested in isolation and shared by the desktop rail and the mobile tab.

import type { AppLang } from '../i18n/ui'

/** BCP 47 tags used for every Intl formatting in the app. */
export const LOCALES: Record<AppLang, string> = { es: 'es-PE', en: 'en-US' }

// Intl.DateTimeFormat construction is the expensive part and the list renders
// up to HISTORY_LIMIT rows, so each (locale, shape) pair is built once.
const formatters = new Map<string, Intl.DateTimeFormat>()

function getFormatter(
  locale: string,
  shape: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}|${shape}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatters.set(key, formatter)
  }
  return formatter
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * `14:32` when the record is from today, `22 sept · 14:32` on another day, and
 * the year is added across a year boundary.
 *
 * No timeZone option: Intl uses the device system zone by definition, the same
 * choice formatEmittedAt documents in share-receipt.tsx. hourCycle h23 pins
 * both locales to 24h -- es-PE renders `02:32 p. m.` and en-US `2:32 p. m.`
 * otherwise, and variable-width times break the tabular-nums column.
 *
 * `now` is injected so the today/not-today branch is deterministic in tests.
 */
export function formatRecordTime(
  createdAt: string,
  lang: AppLang,
  now: Date = new Date()
): string {
  const date = new Date(createdAt)
  // Records round-trip through localStorage and can be hand-edited.
  if (Number.isNaN(date.getTime())) return ''

  const locale = LOCALES[lang]
  const time = getFormatter(locale, 'time', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
  if (isSameDay(date, now)) return time

  const sameYear = date.getFullYear() === now.getFullYear()
  const dayOptions: Intl.DateTimeFormatOptions = sameYear
    ? { day: '2-digit', month: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  const day = getFormatter(
    locale,
    sameYear ? 'day' : 'dayYear',
    dayOptions
  ).format(date)
  return `${day} · ${time}`
}
