import { describe, expect, it } from 'vitest'
import { formatRecordTime, isSameDay, LOCALES } from './history-time.utils'

// Raw Intl output is never asserted: month names and separators drift with the
// ICU build shipped by Node. The shape (24h clock, presence of the day part) is
// what this module actually promises.
const iso = (y: number, m: number, d: number, h: number, min: number) =>
  new Date(y, m - 1, d, h, min).toISOString()

describe('isSameDay', () => {
  it('separates two instants minutes apart across midnight', () => {
    expect(
      isSameDay(new Date(2026, 8, 22, 23, 59), new Date(2026, 8, 23, 0, 1))
    ).toBe(false)
  })

  it('separates the same day number in different months', () => {
    expect(
      isSameDay(new Date(2026, 7, 22, 12, 0), new Date(2026, 8, 22, 12, 0))
    ).toBe(false)
  })

  it('separates the same day number in different years', () => {
    expect(
      isSameDay(new Date(2025, 8, 22, 12, 0), new Date(2026, 8, 22, 12, 0))
    ).toBe(false)
  })

  it('matches two instants on the same calendar day', () => {
    expect(
      isSameDay(new Date(2026, 8, 22, 0, 0), new Date(2026, 8, 22, 23, 59))
    ).toBe(true)
  })
})

describe('formatRecordTime', () => {
  const now = new Date(2026, 8, 23, 10, 0)

  it('renders a 24h time only, for a record saved today', () => {
    const out = formatRecordTime(iso(2026, 9, 23, 14, 32), 'es', now)
    expect(out).toBe('14:32')
    expect(out).not.toContain('·')
  })

  it('keeps the 24h clock in English too', () => {
    expect(formatRecordTime(iso(2026, 9, 23, 14, 32), 'en', now)).toBe('14:32')
  })

  it('pads hours below ten', () => {
    expect(formatRecordTime(iso(2026, 9, 23, 9, 5), 'es', now)).toBe('09:05')
  })

  it('prefixes the day for a record from another day', () => {
    const out = formatRecordTime(iso(2026, 9, 22, 14, 32), 'es', now)
    expect(out).toContain('·')
    expect(out).toMatch(/14:32$/)
  })

  it('adds the year across a year boundary', () => {
    const sameYear = formatRecordTime(iso(2026, 1, 22, 14, 32), 'es', now)
    const otherYear = formatRecordTime(iso(2025, 9, 22, 14, 32), 'es', now)
    expect(sameYear).not.toContain('2026')
    expect(otherYear).toContain('2025')
  })

  it('returns an empty string for a hand-edited createdAt', () => {
    expect(formatRecordTime('not-a-date', 'es', now)).toBe('')
    expect(formatRecordTime('', 'en', now)).toBe('')
  })
})

describe('LOCALES', () => {
  it('maps both app languages', () => {
    expect(LOCALES).toEqual({ es: 'es-PE', en: 'en-US' })
  })
})
