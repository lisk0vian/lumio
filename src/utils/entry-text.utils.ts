// Free-typed amount/kWh entry text: sanitize, parse and format.
// The field stays a *text* input on purpose (see sanitizeEntryText).

/**
 * Filters free-typed entry text down to digits and a single decimal
 * separator, normalizing a comma to a dot ("22,5" -> "22.5").
 *
 * Needed because the amount/kWh field has to stay a *text* input: a
 * controlled number input rewrites its own value on every keystroke, so the
 * trailing separator of a half-typed "22." gets erased and the next digit
 * lands in the wrong place ("22.5" became "225").
 */
export function sanitizeEntryText(text: string): string {
  let sanitized = ''
  let hasSeparator = false

  for (const char of text.replace(/,/g, '.')) {
    if (char >= '0' && char <= '9') {
      sanitized += char
    } else if (char === '.' && !hasSeparator) {
      hasSeparator = true
      sanitized += char
    }
  }

  return sanitized
}

/**
 * Entry text -> number. Anything not yet a usable amount (empty, "0", "0.",
 * a lone separator, text) becomes 0, so intermediate keystrokes never throw
 * off the derived hint. A stray minus sign is dropped rather than negating:
 * this field only accepts non-negative values.
 */
export function parseEntryText(text: string): number {
  const parsed = Number.parseFloat(sanitizeEntryText(text))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Number -> entry text, rounded to 2 decimals with trailing zeros trimmed.
 * Used only when the field is filled from the outside (unit switch, reset,
 * rehydration): without it, a correct conversion like 22.5852 would surface
 * as "22.5852", and repeated switches could expose float residue such as
 * "22.000000000000007".
 */
export function formatEntryText(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return String(Number(value.toFixed(2)))
}
