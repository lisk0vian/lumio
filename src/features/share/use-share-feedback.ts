import { useEffect, useRef, useState } from 'react'

export type ShareStatus = 'idle' | 'working' | 'error'

// Feedback for the last action taken inside the dialog. Success states clear
// themselves; errors stay until the next action replaces them.
export type ActionFeedback = 'idle' | 'copied' | 'downloaded' | 'text' | 'error'

const FEEDBACK_MS = 2400

// "Copiado" used to stay on the button until the dialog closed, so a second
// copy gave no sign it had happened. Success now reverts on its own.
export function useShareFeedback() {
  const [feedback, setFeedback] = useState<ActionFeedback>('idle')
  const feedbackTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimer.current !== null) {
        window.clearTimeout(feedbackTimer.current)
      }
    }
  }, [])

  const flash = (next: ActionFeedback) => {
    if (feedbackTimer.current !== null) {
      window.clearTimeout(feedbackTimer.current)
      feedbackTimer.current = null
    }
    setFeedback(next)
    if (next === 'idle' || next === 'error') return
    feedbackTimer.current = window.setTimeout(() => {
      feedbackTimer.current = null
      setFeedback('idle')
    }, FEEDBACK_MS)
  }

  return { feedback, flash }
}
