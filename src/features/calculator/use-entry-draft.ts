import { useState } from 'react'
import { formatEntryText } from '@/utils/entry-text.utils'

// The field keeps the *written text*, not the number: with a controlled
// numeric input, typing "22." rewrote itself as 22 and the next digit
// landed forming "225". The draft only resyncs when the value changes from
// the outside (unit switch, reset, rehydration), and compares against the
// last value we pushed ourselves: our own 22 (from "22.") must not count
// as an external change, or the dot gets erased all the same.
export function useEntryDraft(rawValue: number) {
  const [draft, setDraft] = useState(() => formatEntryText(rawValue))
  const [pushed, setPushed] = useState(rawValue)
  if (rawValue !== pushed) {
    setPushed(rawValue)
    setDraft(formatEntryText(rawValue))
  }
  return { draft, setDraft, setPushed }
}
